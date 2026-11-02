"""Closed owned CPython copy. No ambient bytecode, site package or path hook.

The 734 source records retain the product pin's exact scope. They are the only
files copied, and every file/directory of the executable copy is inventoried.
This is a different guarantee from executing the original runtime with -B.
"""
import hashlib
import os
from pathlib import Path
import stat
import sys

TREE_PIN = '0f3ef35995160c8db3b4892d9bb3bd9ea0eba75634d4fc4505eef13e7ce56f92'
UV_PIN = '2bfbe53d3cc95799e98fa08323b04844fc01d4f8c87dd5c00089e43f6554f162'
NAMES = ['python.exe','python3.dll','python312.dll','vcruntime140.dll','vcruntime140_1.dll','DLLs','Lib']

def chain(path):
    for part in [*reversed(Path(path).parents), Path(path)]:
        st = part.lstat()
        if stat.S_ISLNK(st.st_mode) or getattr(st,'st_file_attributes',0) & 0x400:
            raise ValueError('RUNTIME_REPARSE')
        if stat.S_ISREG(st.st_mode) and st.st_nlink != 1:
            raise ValueError('RUNTIME_HARDLINK')
        if not (stat.S_ISREG(st.st_mode) or stat.S_ISDIR(st.st_mode)):
            raise ValueError('RUNTIME_TYPE')

def closed_manifest(root, expected_files):
    """Same closed policy as native preflight, repeated before every child UV."""
    root = Path(os.path.abspath(root))
    chain(root)
    for base in [root, root.parent]:
        if (base/'pyvenv.cfg').exists():
            raise ValueError('RUNTIME_VENV')
    expected = {r['name']:r['sha256'] for r in expected_files}
    dirs = {'Lib/site-packages'}
    for name in expected:
        if Path(name).is_absolute() or '..' in Path(name).parts or '\\' in name or ':' in name:
            raise ValueError('RUNTIME_RECORD')
        dirs.update(p.as_posix() for p in Path(name).parents if str(p) != '.')
    records, count = {}, 0
    def visit(path, depth):
        nonlocal count
        count += 1
        if count > 4096 or depth > 16:
            raise ValueError('RUNTIME_BOUND')
        chain(path)
        name = path.relative_to(root).as_posix()
        if path.is_dir():
            if name not in dirs:
                raise ValueError('RUNTIME_EXTRA: '+name)
            for child in path.iterdir():
                visit(child,depth+1)
        else:
            if name not in expected:
                raise ValueError('RUNTIME_EXTRA: '+name)
            before = path.stat()
            raw = path.read_bytes()
            after = path.stat()
            if (before.st_ino,before.st_size,before.st_mtime_ns,before.st_ctime_ns) != (after.st_ino,after.st_size,after.st_mtime_ns,after.st_ctime_ns):
                raise ValueError('RUNTIME_CHANGED')
            value = hashlib.sha256(raw).hexdigest()
            if value != expected[name]:
                raise ValueError('RUNTIME_CHANGED: '+name)
            records[name] = value
    for path in root.iterdir():
        visit(path,0)
    if records != expected or not (root/'Lib/site-packages').is_dir():
        raise ValueError('RUNTIME_MISSING')
    fingerprint = hashlib.sha256(''.join(r['name']+':'+records[r['name']]+'\n' for r in expected_files).encode()).hexdigest()
    return {'root':str(root),'files':expected_files,'sha256':fingerprint,'policy':'closed-copy-v2'}

def filtered_env(cache):
    allowed = {'SYSTEMROOT','WINDIR','PATH'}
    cache = Path(cache)
    return {**{k:v for k,v in os.environ.items() if k.upper() in allowed},
            'UV_CACHE_DIR':str(cache), 'TEMP':str(cache/'tmp'), 'TMP':str(cache/'tmp')}

def isolated_state():
    return {'executable':sys.executable,'prefix':sys.prefix,'base_prefix':sys.base_prefix,
            'isolated':sys.flags.isolated,'no_site':sys.flags.no_site,
            'dont_write_bytecode':sys.dont_write_bytecode,'site_loaded':'site' in sys.modules,'sys_path':sys.path}
