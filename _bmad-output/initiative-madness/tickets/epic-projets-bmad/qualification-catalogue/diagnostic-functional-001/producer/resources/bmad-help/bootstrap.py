"""Source-only bootstrap, passed as -c before any harness module is imported."""
import hashlib
import importlib.abc
import importlib.util
import json
import os
from pathlib import Path
import stat
import sys
import types

root, logical, manifest_text, entry, *arguments = sys.argv[1:]
root, logical = Path(root), Path(logical)
manifest = json.loads(manifest_text)
sources = {}
for name, expected in manifest.items():
    if not name.isidentifier():
        raise ValueError('SOURCE_NAME')
    path = root / (name + '.py')
    for part in [*reversed(path.parents), path]:
        info = part.lstat()
        if stat.S_ISLNK(info.st_mode) or getattr(info, 'st_file_attributes', 0) & 0x400:
            raise ValueError('SOURCE_REPARSE')
        if stat.S_ISREG(info.st_mode) and info.st_nlink != 1:
            raise ValueError('SOURCE_HARDLINK')
    before = path.stat()
    if before.st_size > 1024 * 1024:
        raise ValueError('SOURCE_BOUND')
    raw = path.read_bytes()
    after = path.stat()
    if (before.st_ino, before.st_size, before.st_mtime_ns, before.st_ctime_ns) != (after.st_ino, after.st_size, after.st_mtime_ns, after.st_ctime_ns):
        raise ValueError('SOURCE_CHANGED')
    if hashlib.sha256(raw).hexdigest() != expected:
        raise ValueError('SOURCE_CHANGED: ' + name)
    sources[name] = raw

closure = types.ModuleType('_bmad_source_closure')
closure.sha256 = dict(manifest)
closure.sources = sources
closure.compiled = []
closure.bootstrap_sha256 = hashlib.sha256(sys.orig_argv[sys.orig_argv.index('-c') + 1].encode('utf-8')).hexdigest()
sys.modules[closure.__name__] = closure

class Sources(importlib.abc.MetaPathFinder, importlib.abc.Loader):
    def find_spec(self, fullname, path=None, target=None):
        if fullname in sources:
            return importlib.util.spec_from_loader(fullname, self)
        return None

    def create_module(self, spec):
        return None

    def exec_module(self, module):
        name = module.__name__
        module.__file__ = str(logical / (name + '.py'))
        closure.compiled.append(name)
        exec(compile(sources[name], module.__file__, 'exec'), module.__dict__)

if any(os.path.normcase(str(root)) == os.path.normcase(str(Path(value or '.').absolute())) or os.path.normcase(str(logical)) == os.path.normcase(str(Path(value or '.').absolute())) for value in sys.path):
    raise ValueError('SOURCE_SEARCH_PATH')
sys.meta_path.insert(0, Sources())
sys.argv = [str(logical / (entry + '.py')), *arguments]
if entry not in sources:
    raise ValueError('SOURCE_ENTRY')
module = types.ModuleType('__main__')
module.__file__ = sys.argv[0]
sys.modules['__main__'] = module
exec(compile(sources[entry], module.__file__, 'exec'), module.__dict__)