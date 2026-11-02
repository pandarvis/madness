"""Pinned base CPython; same effective tree as src/adapters/bmad/runtime.ts."""
import hashlib
import os
from pathlib import Path
import stat
import sys

TREE_PIN = '0f3ef35995160c8db3b4892d9bb3bd9ea0eba75634d4fc4505eef13e7ce56f92'
UV_PIN = '2bfbe53d3cc95799e98fa08323b04844fc01d4f8c87dd5c00089e43f6554f162'
PTH_PIN = '2638ce9e2500e572a5e0de7faed6661eb569d1b696fcba07b0dd223da5f5d224'
NAMES = ['python.exe', 'python3.dll', 'python312.dll', 'vcruntime140.dll', 'vcruntime140_1.dll', 'DLLs', 'Lib']
SKIP = {'site-packages', '__pycache__', 'test', 'tests'}

def runtime_manifest(root):
    root = Path(os.path.abspath(root))
    records = []
    def visit(path):
        info = path.lstat()
        if stat.S_ISLNK(info.st_mode) or getattr(info, 'st_file_attributes', 0) & 0x400:
            raise ValueError('RUNTIME_REPARSE: ' + str(path))
        if path.is_dir():
            for child in sorted(path.iterdir(), key=lambda p: p.name):
                if child.name not in SKIP:
                    visit(child)
        elif path.suffix.lower() in {'.py', '.exe', '.dll', '.pyd', '.zip', '.pth'}:
            if info.st_nlink != 1:
                raise ValueError('RUNTIME_HARDLINK')
            records.append({'name': path.relative_to(root).as_posix(), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
    for name in NAMES:
        visit(root / name)
    fingerprint = hashlib.sha256(''.join(r['name'] + ':' + r['sha256'] + '\n' for r in records).encode()).hexdigest()
    return {'root': str(root), 'files': records, 'sha256': fingerprint}

def select_base(candidate, project, expected=TREE_PIN):
    candidate, project = Path(os.path.abspath(candidate)), Path(os.path.abspath(project))
    if candidate.is_relative_to(project) or candidate.name.lower() != 'python.exe' or (candidate.parent / 'pyvenv.cfg').exists() or (candidate.parent.parent / 'pyvenv.cfg').exists():
        raise ValueError('RUNTIME_LOCATION')
    if list(candidate.parent.glob('python*._pth')):
        raise ValueError('RUNTIME_PATH_OVERRIDE')
    for parent in [*candidate.parents, candidate]:
        info = parent.lstat()
        if stat.S_ISLNK(info.st_mode) or getattr(info, 'st_file_attributes', 0) & 0x400:
            raise ValueError('RUNTIME_REPARSE')
    manifest = runtime_manifest(candidate.parent)
    if manifest['sha256'] != expected:
        raise ValueError('RUNTIME_CHANGED')
    return manifest

def startup_manifest(root):
    """UV queries with -I -B, including site. Admit one exact neutralized hook.

    Its only unconditional dependency is pinned stdlib os. With stdlib forced,
    the short-circuit excludes _distutils_hack; neither its bytes nor any other
    site-package are treated as a startup dependency. New hooks are refused.
    """
    root = Path(root)
    site = root / 'Lib/site-packages'
    for path in [root, site]:
        for ancestor in [*reversed(path.parents), path]:
            info = ancestor.lstat()
            if stat.S_ISLNK(info.st_mode) or getattr(info, 'st_file_attributes', 0) & 0x400:
                raise ValueError('STARTUP_REPARSE')
        for index, child in enumerate(path.iterdir()):
            if index >= 4096:
                raise ValueError('STARTUP_COUNT')
            name = child.name.casefold()
            if name.startswith(('sitecustomize', 'usercustomize')) or path == root and (name.endswith('._pth') or name == 'python312.zip'):
                raise ValueError('STARTUP_OVERRIDE: ' + child.name)
    files = sorted(path for path in site.iterdir() if path.suffix.casefold()=='.pth')
    if [p.name for p in files] != ['distutils-precedence.pth']:
        raise ValueError('STARTUP_HOOK_SET')
    path = files[0]
    before = path.lstat()
    if not stat.S_ISREG(before.st_mode) or before.st_nlink != 1 or getattr(before, 'st_file_attributes', 0) & 0x400:
        raise ValueError('STARTUP_TYPE')
    raw = path.read_bytes()
    if len(raw) != 151 or hashlib.sha256(raw).hexdigest() != PTH_PIN:
        raise ValueError('STARTUP_HOOK_CHANGED')
    after = path.lstat()
    if (before.st_ino,before.st_size,before.st_mtime_ns) != (after.st_ino,after.st_size,after.st_mtime_ns):
        raise ValueError('STARTUP_CHANGED')
    return {'schema':1,'pth':[{'path':'Lib/site-packages/'+path.name,'bytes':len(raw),'sha256':PTH_PIN,'content':raw.decode('utf-8')}],
            'absent':['sitecustomize*','usercustomize*','python*._pth','python312.zip'],
            'forced_environment':{'SETUPTOOLS_USE_DISTUTILS':'stdlib'}, 'unconditional_dependency':'pinned Lib/os.py',
            'excluded_dependency':'_distutils_hack.add_shim (short-circuit false)'}

def filtered_env(cache):
    allowed = {'SYSTEMROOT', 'WINDIR', 'TEMP', 'TMP', 'PATH'}
    return {**{k:v for k,v in os.environ.items() if k.upper() in allowed}, 'UV_CACHE_DIR': str(cache), 'SETUPTOOLS_USE_DISTUTILS':'stdlib'}

def isolated_state():
    return {'executable': sys.executable, 'prefix': sys.prefix, 'base_prefix': sys.base_prefix,
            'isolated': sys.flags.isolated, 'no_site': sys.flags.no_site,
            'dont_write_bytecode': sys.dont_write_bytecode,
            'site_loaded': 'site' in sys.modules, 'sys_path': sys.path}
