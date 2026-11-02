from __future__ import annotations
import ctypes
import hashlib
import importlib.util
import io
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


sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent


FILE_LIMIT = 1024 * 1024
TOTAL_LIMIT = 16 * 1024 * 1024
COUNT_LIMIT = 1024
DEPTH_LIMIT = 12
OUTPUT_LIMIT = 4 * 1024 * 1024
TIME_LIMIT = 60
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

def display_path(value):
    text=str(value)
    if text.startswith('\\\\?\\UNC\\'):return '\\\\'+text[8:]
    if text.startswith('\\\\?\\'):return text[4:]
    return text

def long_path(value):
    text=os.path.abspath(str(value))
    if sys.platform=='win32' and not text.startswith('\\\\?\\'):
        text='\\\\?\\UNC\\'+text[2:] if text.startswith('\\\\') else '\\\\?\\'+text
    return Path(text)


def confined_output(project, value):
    project = long_path(project)
    if not isinstance(value, str) or not value or '\x00' in value:
        raise Refusal('OUTPUT_INVALID')
    if '://' in value or ':' in value.replace('{project-root}', '') and not Path(value).is_absolute():
        raise Refusal('OUTPUT_INVALID')
    expanded = value.replace('{project-root}', str(project))
    raw = Path(expanded)
    if '..' in raw.parts:
        raise Refusal('TRAVERSAL')
    candidate = long_path(raw if raw.is_absolute() else project / raw)
    if not candidate.is_relative_to(project):
        raise Refusal('OUTSIDE_PROJECT')
    inspect_chain(candidate, missing=True)
    return candidate

_handle_function = None
def handle_path(fd):
    if sys.platform != 'win32':
        raise Refusal('WINDOWS_REQUIRED')
    import msvcrt
    global _handle_function
    if _handle_function is None:
        kernel = ctypes.WinDLL('kernel32', use_last_error=True)
        fn = kernel.GetFinalPathNameByHandleW
        fn.argtypes = [ctypes.c_void_p, ctypes.c_wchar_p, ctypes.c_uint32, ctypes.c_uint32]
        fn.restype = ctypes.c_uint32
        _handle_function = fn
    fn = _handle_function
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

def read_safe(path, *, before_open=None, file_limit=FILE_LIMIT, utf8=True):
    chain = inspect_chain(path)
    original = path.lstat()
    if not stat.S_ISREG(original.st_mode):
        raise Refusal('TYPE')
    if original.st_size > file_limit:
        raise Refusal('FILE_LIMIT')
    if before_open:
        before_open()
    fd = os.open(path, os.O_RDONLY | os.O_BINARY)
    try:
        opened = os.fstat(fd)
        # Check the actual handle and lexical ancestors before reading any bytes.
        if os.path.normcase(str(handle_path(fd))) != os.path.normcase(display_path(path.absolute())):
            raise Refusal('HANDLE_REDIRECTED')
        if identity(opened) != identity(original) or inspect_chain(path) != chain:
            raise Refusal('CHANGED')
        data = bytearray()
        while True:
            chunk = os.read(fd, min(65536, file_limit + 1 - len(data)))
            if not chunk:
                break
            data.extend(chunk)
            if len(data) > file_limit:
                raise Refusal('FILE_LIMIT')
        EVENTS.append({'kind': 'read', 'path': str(path), 'bytes': len(data)})
        final = os.fstat(fd)
        if (final.st_size, final.st_mtime_ns, final.st_ctime_ns) != (opened.st_size, opened.st_mtime_ns, opened.st_ctime_ns) or inspect_chain(path) != chain:
            raise Refusal('CHANGED')
        try:
            if utf8:
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

