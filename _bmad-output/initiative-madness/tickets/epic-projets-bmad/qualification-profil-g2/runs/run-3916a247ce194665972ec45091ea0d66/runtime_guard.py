"""Pinned base CPython; same effective tree as src/adapters/bmad/runtime.ts."""
import hashlib
import os
from pathlib import Path
import stat
import sys

TREE_PIN = '0f3ef35995160c8db3b4892d9bb3bd9ea0eba75634d4fc4505eef13e7ce56f92'
UV_PIN = '2bfbe53d3cc95799e98fa08323b04844fc01d4f8c87dd5c00089e43f6554f162'
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

def filtered_env(cache):
    allowed = {'SYSTEMROOT', 'WINDIR', 'TEMP', 'TMP', 'PATH'}
    return {**{k:v for k,v in os.environ.items() if k.upper() in allowed}, 'UV_CACHE_DIR': str(cache)}

def isolated_state():
    return {'executable': sys.executable, 'prefix': sys.prefix, 'base_prefix': sys.base_prefix,
            'isolated': sys.flags.isolated, 'no_site': sys.flags.no_site,
            'dont_write_bytecode': sys.dont_write_bytecode,
            'site_loaded': 'site' in sys.modules, 'sys_path': sys.path}
