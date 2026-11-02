"""Offline G2 qualification; trusted tools operate on validated data snapshots.

No project Python is imported. The only executable inputs are this harness, the
locked CPython runtime, and the specifically locked managed tools. Nothing here
is wired into Madness. Bounds are experimental profile values, not BMad limits.
"""
from __future__ import annotations
import ctypes
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import stat
import subprocess
import sys
import threading
import time
import tomllib
import types
import runtime_guard as runtime

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
PROJECT = HERE.parents[4]
LOCK = HERE / 'sources-lock.json'
FILE_LIMIT = 1024 * 1024
TOTAL_LIMIT = 16 * 1024 * 1024
COUNT_LIMIT = 1024
DEPTH_LIMIT = 12
OUTPUT_LIMIT = 4 * 1024 * 1024
TIME_LIMIT = 15
EVENTS = []

class Refusal(ValueError):
    def __init__(self, code, detail=''):
        self.code = code
        super().__init__(code + (': ' + detail if detail else ''))

def sha(raw):
    return hashlib.sha256(raw).hexdigest()

def identity(st):
    return (st.st_dev, st.st_ino, st.st_mode, st.st_nlink,
            getattr(st, 'st_file_attributes', 0))

def path_chain(path):
    path = Path(os.path.abspath(path))
    return [*reversed(path.parents), path]

def inspect_chain(path, *, missing=False):
    """Inspect lexical ancestors, never resolve first (which hides junctions)."""
    result = []
    for part in path_chain(path):
        try:
            st = part.lstat()
        except FileNotFoundError:
            if missing:
                break
            raise Refusal('MISSING', str(part))
        if stat.S_ISLNK(st.st_mode) or getattr(st, 'st_file_attributes', 0) & 0x400:
            raise Refusal('REPARSE', str(part))
        if stat.S_ISREG(st.st_mode) and st.st_nlink != 1:
            raise Refusal('HARDLINK', str(part))
        if not (stat.S_ISREG(st.st_mode) or stat.S_ISDIR(st.st_mode)):
            raise Refusal('TYPE', str(part))
        result.append((str(part), identity(st)))
    return result

def confined_output(project, value):
    if not isinstance(value, str) or not value or '\x00' in value:
        raise Refusal('OUTPUT_INVALID')
    if '://' in value or ':' in value.replace('{project-root}', '') and not Path(value).is_absolute():
        raise Refusal('OUTPUT_INVALID')
    expanded = value.replace('{project-root}', str(project))
    raw = Path(expanded)
    if '..' in raw.parts:
        raise Refusal('TRAVERSAL')
    candidate = Path(os.path.abspath(raw if raw.is_absolute() else project / raw))
    if not candidate.is_relative_to(project):
        raise Refusal('OUTSIDE_PROJECT')
    inspect_chain(candidate, missing=True)
    return candidate

def handle_path(fd):
    if sys.platform != 'win32':
        raise Refusal('WINDOWS_REQUIRED')
    import msvcrt
    kernel = ctypes.WinDLL('kernel32', use_last_error=True)
    fn = kernel.GetFinalPathNameByHandleW
    fn.argtypes = [ctypes.c_void_p, ctypes.c_wchar_p, ctypes.c_uint32, ctypes.c_uint32]
    fn.restype = ctypes.c_uint32
    buf = ctypes.create_unicode_buffer(32768)
    n = fn(msvcrt.get_osfhandle(fd), buf, len(buf), 0)
    if not n or n >= len(buf):
        raise Refusal('HANDLE_PATH')
    value = buf.value
    if value.startswith('\\\\?\\UNC\\'):
        value = '\\\\' + value[8:]
    elif value.startswith('\\\\?\\'):
        value = value[4:]
    return Path(value)

def read_safe(path, *, before_open=None):
    chain = inspect_chain(path)
    original = path.lstat()
    if not stat.S_ISREG(original.st_mode):
        raise Refusal('TYPE')
    if original.st_size > FILE_LIMIT:
        raise Refusal('FILE_LIMIT')
    if before_open:
        before_open()
    fd = os.open(path, os.O_RDONLY | os.O_BINARY)
    try:
        opened = os.fstat(fd)
        # Check the actual handle and lexical ancestors before reading any bytes.
        if os.path.normcase(str(handle_path(fd))) != os.path.normcase(str(path.absolute())):
            raise Refusal('HANDLE_REDIRECTED')
        if identity(opened) != identity(original) or inspect_chain(path) != chain:
            raise Refusal('CHANGED')
        data = bytearray()
        while True:
            chunk = os.read(fd, min(65536, FILE_LIMIT + 1 - len(data)))
            if not chunk:
                break
            data.extend(chunk)
            if len(data) > FILE_LIMIT:
                raise Refusal('FILE_LIMIT')
        EVENTS.append({'kind': 'read', 'path': str(path), 'bytes': len(data)})
        final = os.fstat(fd)
        if (final.st_size, final.st_mtime_ns, final.st_ctime_ns) != (opened.st_size, opened.st_mtime_ns, opened.st_ctime_ns) or inspect_chain(path) != chain:
            raise Refusal('CHANGED')
        try:
            bytes(data).decode('utf-8', errors='strict')
        except UnicodeError:
            raise Refusal('UTF8') from None
        return bytes(data)
    finally:
        os.close(fd)

def capture(root, authorized, *, count_limit=COUNT_LIMIT, depth_limit=DEPTH_LIMIT, total_limit=TOTAL_LIMIT):
    root = Path(os.path.abspath(root))
    if root not in [Path(os.path.abspath(p)) for p in authorized]:
        raise Refusal('ROOT_NOT_AUTHORIZED')
    initial = inspect_chain(root)
    files, dirs, size, entries = {}, {}, 0, 0
    def visit(folder, depth):
        nonlocal size, entries
        if depth > depth_limit:
            raise Refusal('DEPTH_LIMIT')
        dirs[str(folder.relative_to(root))] = identity(folder.lstat())
        with os.scandir(folder) as iterator:
            for entry in iterator:
                entries += 1
                if entries > count_limit:
                    raise Refusal('COUNT_LIMIT')
                path = Path(entry.path)
                inspect_chain(path)
                st = path.lstat()
                if stat.S_ISDIR(st.st_mode):
                    visit(path, depth + 1)
                else:
                    raw = read_safe(path)
                    size += len(raw)
                    if size > total_limit:
                        raise Refusal('TOTAL_LIMIT')
                    files[path.relative_to(root).as_posix()] = {'sha256': sha(raw), 'raw': raw, 'identity': identity(st)}
    visit(root, 0)
    if inspect_chain(root) != initial:
        raise Refusal('CHANGED')
    receipt = {'root': str(root), 'dirs': dirs, 'files': files, 'bytes': size, 'entries': entries}
    receipt['revision'] = sha(json.dumps(public_receipt(receipt), sort_keys=True).encode())
    return receipt

def public_receipt(receipt):
    return {'root': receipt['root'], 'dirs': receipt['dirs'], 'files': {
        name: {k: v for k, v in item.items() if k != 'raw'} for name, item in receipt['files'].items()}}

def fresh(receipt):
    current = capture(Path(receipt['root']), [Path(receipt['root'])])
    if current['revision'] != receipt['revision']:
        raise Refusal('STALE_REVISION')
    return True

def stage(receipt, target):
    fresh(receipt)
    for name, item in receipt['files'].items():
        path = target / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(item['raw'])
    for name in receipt['dirs']:
        (target / name).mkdir(parents=True, exist_ok=True)
    return target

def load_lock():
    return json.loads(LOCK.read_text(encoding='utf-8'))

def check_lock():
    lock = load_lock()
    for item in lock['tools']:
        path = Path(item['path'])
        inspect_chain(path)
        # Runtime binaries are not textual and have a separate explicit limit.
        if path.stat().st_size > 32 * 1024 * 1024 or sha(path.read_bytes()) != item['sha256']:
            raise Refusal('TOOL_CHANGED', str(path))
    if runtime.select_base(Path(lock['runtime']['root']) / 'python.exe', PROJECT) != lock['runtime']:
        raise Refusal('RUNTIME_CHANGED')
    if sha(Path(lock['uv']['path']).read_bytes()) != lock['uv']['sha256'] or lock['uv']['sha256'] != runtime.UV_PIN:
        raise Refusal('UV_CHANGED')
    return lock

def load_tool(name):
    item = next(item for item in load_lock()['tools'] if item['name'] == name)
    raw = read_safe(Path(item['path']))
    if sha(raw) != item['sha256']:
        raise Refusal('TOOL_CHANGED')
    mod = types.ModuleType(name)
    mod.__file__ = item['path']
    sys.modules[name] = mod
    exec(compile(raw, item['path'], 'exec'), mod.__dict__)
    return mod

def worker(request):
    check_lock()
    guard_request(request)
    denied = []
    def audit(event, args):
        if event.startswith('socket.') or event in ('subprocess.Popen', 'os.system', 'os.exec', 'os.posix_spawn'):
            denied.append(event)
            raise Refusal('EFFECT_DENIED', event)
        if event == 'open':
            mode, flags = args[1:3]
            if isinstance(mode, str) and any(c in mode for c in 'wax+') or isinstance(flags, int) and flags & (os.O_WRONLY | os.O_RDWR | os.O_CREAT | os.O_TRUNC):
                denied.append('write')
                raise Refusal('WRITE_DENIED')
    sys.addaudithook(audit)
    # Fixed tools lack comprehensive bounds; check the private snapshot again in
    # the child before any managed function may consume it.
    for path in [*request.get('roots', []), *[request[k] for k in ('project', 'skill', 'folder') if request.get(k)]]:
        capture(Path(path), [Path(path)])
    config = load_tool('config_utils')
    knowledge = load_tool('knowledge')
    roster = load_tool('roster')
    tickets = load_tool('tickets')
    op = request['op']
    roots = [Path(p) for p in request.get('roots', [])]
    project = Path(request['project']) if request.get('project') else None
    if op == 'knowledge':
        value = knowledge.collect(roots, include_content=request.get('content', False))
        scan = knowledge.scan(roots)
        value['module_records'] = [{'code': m.code, 'folder': str(m.folder), 'table': m.table, 'skills': m.skills} for m in scan.modules]
        value['profile_issues'] = []
        # Exact commands are descriptive. Profile qualification never launches.
        for skill in value['skills']:
            path = Path(skill['root']) / skill['skill'] / 'SKILL.md'
            skill.update(command='$' + skill['skill'], skill_file_present=path.is_file(), launch='unqualified')
            module = next((m for m in scan.modules if m.folder.name == skill['bmod']), None)
            skill['listed_member'] = module is not None and skill['skill'] in module.skills
        installed = {s['skill']: s for s in value['skills']}
        for module in scan.modules:
            for member in module.skills:
                if member not in installed:
                    value['profile_issues'].append({'kind': 'member-missing', 'module': module.code, 'skill': member})
                elif installed[member]['bmod'] != module.folder.name:
                    value['profile_issues'].append({'kind': 'member-contradiction', 'module': module.code,
                        'module_record': str(module.folder / 'bmod.toml'), 'skill': member,
                        'skill_record': str(Path(installed[member]['root']) / member / 'bmod.toml'),
                        'declared_bmod': installed[member]['bmod']})
            for dependency in module.table.get('required_skills', []):
                name = dependency.get('skill') if isinstance(dependency, dict) else dependency
                if name not in installed:
                    value['profile_issues'].append({'kind': 'dependency-missing', 'module': module.code, 'skill': name})
    elif op == 'config':
        value = config.load_central_config(project)
    elif op == 'customization':
        value = config.load_customization(project, Path(request['skill']))
    elif op == 'roster':
        # agent_identity suppresses ConfigError. Validate precisely those skill
        # customizations a roster will exploit before the official collection.
        config.load_central_config(project)
        found = knowledge.scan(roots)
        for module in found.modules:
            roster_path = module.folder / knowledge.ROSTER_NAME
            if roster_path.exists():
                table = tomllib.loads(read_safe(roster_path).decode('utf-8'))
                for member in table.get('members', []):
                    name = member.get('skill') if isinstance(member, dict) else None
                    if name in found.folders:
                        try:
                            config.load_customization(project, found.folders[name])
                        except (config.ConfigError, OSError) as error:
                            raise Refusal('ROSTER_CUSTOMIZATION', str(error)) from None
        value = roster.collect(roots, project)
    elif op == 'tickets':
        problems = []
        proofs = ticket_proofs(tickets, Path(request['folder']))
        rows = tickets.load_folder(Path(request['folder']), problems)
        value = {'rows': rows, 'sources': proofs, 'problems': problems, 'acceptance': 'unknown'}
    elif op == 'runtime-state':
        value = runtime.isolated_state()
    elif op == 'audit-probe':
        import socket
        try:
            socket.socket()
        except Refusal:
            pass
        try:
            Path(request['sentinel']).write_text('forbidden')
        except Refusal:
            pass
        value = {'denied': denied}
    else:
        raise Refusal('OPERATION_NOT_ALLOWED')
    return {'value': value, 'denied_effects': denied}

def guard_request(request):
    if request.get('op') not in {'knowledge', 'config', 'customization', 'roster', 'tickets', 'audit-probe', 'runtime-state'}:
        raise Refusal('OPERATION_NOT_ALLOWED')
    paths = [*request.get('roots', []), *[request[k] for k in ('project', 'skill', 'folder', 'sentinel') if request.get(k)]]
    for value in paths:
        path = Path(os.path.abspath(value))
        if not path.is_relative_to(HERE) or not path.relative_to(HERE).parts or not path.relative_to(HERE).parts[0].startswith('fixtures-run-'):
            raise Refusal('ROOT_NOT_AUTHORIZED')
        inspect_chain(path, missing=True)

def run_tool(request):
    check_lock()
    guard_request(request)
    lock = load_lock()
    python = str(Path(lock['runtime']['root']) / 'python.exe')
    bootstrap = "import runpy,sys;sys.path.insert(0,sys.argv[1]);sys.argv=sys.argv[2:];runpy.run_path(sys.argv[0],run_name='__main__')"
    command = [lock['uv']['path'], 'run', '--offline', '--no-project', '--no-config', '--no-cache',
               '--python', python, '--', python, '-I', '-S', '-B', '-c', bootstrap,
               str(HERE), str(HERE / 'prototype.py'), '--worker']
    start = time.monotonic()
    proc = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                            cwd=HERE, env=runtime.filtered_env(HERE / 'fixtures-uv-cache'))
    buffers = [bytearray(), bytearray()]
    overflow = []
    def collect(stream, buffer):
        while True:
            block = stream.read(65536)
            if not block:
                return
            if len(buffer) + len(block) > OUTPUT_LIMIT:
                overflow.append(True)
                proc.kill()
                return
            buffer.extend(block)
    threads = [threading.Thread(target=collect, args=(stream, buffer), daemon=True)
               for stream, buffer in zip((proc.stdout, proc.stderr), buffers)]
    for thread in threads:
        thread.start()
    try:
        proc.stdin.write(json.dumps(request).encode())
        proc.stdin.close()
        proc.wait(timeout=TIME_LIMIT)
    except subprocess.TimeoutExpired:
        proc.kill()
        proc.wait()
        raise Refusal('TIME_LIMIT') from None
    finally:
        for thread in threads:
            thread.join(timeout=2)
        proc.stdout.close()
        proc.stderr.close()
    if overflow:
        raise Refusal('OUTPUT_LIMIT')
    out = json.loads(bytes(buffers[0]).decode('utf-8'))
    EVENTS.append({'kind': 'managed-call', 'op': request['op'], 'argv': command,
                   'duration_ms': round((time.monotonic() - start) * 1000), 'exit': proc.returncode,
                   'stdout_bytes': len(buffers[0]), 'stderr_bytes': len(buffers[1])})
    if proc.returncode:
        raise Refusal(out.get('error', 'TOOL_FAILED'), out.get('detail', ''))
    return out

def ticket_proofs(tickets, folder):
    """Capture before join_plans overwrites status; retain raw text + parsed data."""
    directory = tickets.tickets_dir(folder)
    result = {'entries': [], 'leaves': [], 'plans': [], 'trackers': [], 'files': []}
    for path in sorted(directory.iterdir()):
        if not path.is_file() or path.suffix not in {'.md', '.toml'}:
            continue
        raw = read_safe(path)
        source = {'path': str(path), 'sha256': sha(raw), 'content': raw.decode('utf-8')}
        fields = tomllib.loads(source['content']) if path.name == 'tickets.toml' else tickets.parse_frontmatter(source['content'], lenient=True) if path.suffix == '.md' else {}
        source['fields'] = fields
        result['files'].append(source)
        if path.name == 'tickets.toml':
            for entry in fields.get('entry', []):
                result['entries'].append({'id': entry['id'], 'source': str(path), 'sha256': source['sha256'], 'fields': entry})
        elif fields.get('type') in tickets.LEAF_TYPES:
            result['leaves'].append(source)
            result['trackers'].append({'id': fields.get('id'), 'source': str(path), 'sha256': source['sha256'],
                'fields': {k:v for k,v in fields.items() if k.startswith('tracker_') or k in {'remote', 'assignee'}}})
        elif 'ticket' in fields:
            result['plans'].append(source)
    return result

def context(project, config, selected=None):
    output = confined_output(project, config.get('core', {}).get('output_folder', '{project-root}/_bmad-output'))
    active = config.get('core', {}).get('active_initiative')
    initial = inspect_chain(project)
    available, files, dirs, size, entries = [], {}, {}, 0, 0
    def add(path):
        nonlocal size, entries
        entries += 1
        if entries > COUNT_LIMIT:
            raise Refusal('COUNT_LIMIT')
        raw = read_safe(path)
        size += len(raw)
        if size > TOTAL_LIMIT:
            raise Refusal('TOTAL_LIMIT')
        files[path.relative_to(project).as_posix()] = {'sha256': sha(raw), 'raw': raw, 'identity': identity(path.lstat())}
    for rel in ['_bmad/config.toml', '_bmad/custom/config.toml', '_bmad/custom/config.user.toml']:
        path = project / rel
        inspect_chain(path, missing=True)
        if path.exists():
            add(path)
    if output.exists():
        inspect_chain(output)
        dirs[output.relative_to(project).as_posix()] = identity(output.lstat())
        for index, path in enumerate(output.iterdir()):
            if index + entries >= COUNT_LIMIT:
                raise Refusal('COUNT_LIMIT')
            inspect_chain(path)
            if path.is_dir() and (path / (path.name + '.md')).is_file():
                dirs[path.relative_to(project).as_posix()] = identity(path.lstat())
                add(path / (path.name + '.md'))
                available.append(path.name)
    if active is not None and (not isinstance(active, str) or not active or Path(active).name != active or ':' in active or '\\' in active or '/' in active or active in ('.', '..')):
        raise Refusal('INITIATIVE_INVALID')
    receipt = {'kind': 'context-v1', 'root': str(project), 'dirs': dirs, 'files': files,
               'bytes': size, 'entries': entries, 'resolved_config': config}
    receipt['revision'] = sha(json.dumps({**public_receipt(receipt), 'resolved_config': config}, sort_keys=True).encode())
    if inspect_chain(project) != initial:
        raise Refusal('CHANGED')
    for rel, expected in dirs.items():
        inspect_chain(project / rel)
        if identity((project / rel).lstat()) != expected:
            raise Refusal('CHANGED')
    return {'output': str(output), 'available': sorted(available), 'active_bmad': active,
            'selected_madness': selected, 'state': 'conflict' if selected and active and selected != active else
            'active-missing' if active and active not in available else 'resolved' if active else 'none',
            'invocation_allowed': False, 'receipt': receipt}

def fresh_context(receipt):
    current = context(Path(receipt['root']), receipt['resolved_config'])['receipt']
    if current['revision'] != receipt['revision']:
        raise Refusal('STALE_CONTEXT')
    return True

def json_value(value):
    if isinstance(value, bytes):
        return value.decode('utf-8')
    return str(value)

def classify(config_present, legacy_present, inventory=None):
    if not config_present:
        return 'legacy-observed' if legacy_present else 'absent'
    if inventory is None:
        return 'partial'
    versions = {m['table'].get('version') for m in inventory['module_records']}
    if not versions:
        return 'partial'
    if versions != {'6.13.0-next'}:
        return 'unknown'
    return 'partial' if inventory['problems'] or inventory['profile_issues'] or any(not s['skill_file_present'] or not s['listed_member'] for s in inventory['skills']) else 'candidate-observed'

if __name__ == '__main__':
    if sys.argv[1:] != ['--worker']:
        raise SystemExit('This harness only accepts --worker JSON on stdin; run scenarios.py.')
    try:
        result = worker(json.loads(sys.stdin.buffer.read(65537).decode('utf-8')))
        raw = json.dumps(result, ensure_ascii=False, default=str).encode('utf-8')
        if len(raw) > OUTPUT_LIMIT:
            raise Refusal('OUTPUT_LIMIT')
        sys.stdout.buffer.write(raw)
    except Exception as error:
        sys.stdout.buffer.write(json.dumps({'error': getattr(error, 'code', type(error).__name__),
                                           'detail': str(error)}).encode('utf-8'))
        raise SystemExit(1)
