"""Owned disposable data and closed preservation inventory, no downloaded inputs."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import sys
import uuid
import runtime_guard as runtime

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parents[4]

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def preservation_paths():
    roots = ['src', 'tests', 'resources', '_bmad/scripts', '.agents/skills']
    paths = []
    for root in roots:
        paths.extend(p for p in (PROJECT / root).rglob('*') if p.is_file())
    paths.extend((PROJECT / '_bmad/custom').glob('*.toml'))
    paths.extend(PROJECT.glob('package*.json'))
    paths.extend(PROJECT.glob('tsconfig*.json'))
    paths.extend(PROJECT.glob('*config*.ts'))
    paths.extend([PROJECT / '_bmad/config.toml', PROJECT / 'skills-lock.json'])
    return sorted(set(p for p in paths if p.is_file()))

def preservation():
    return {p.relative_to(PROJECT).as_posix(): digest(p) for p in preservation_paths()}

def bootstrap():
    """One explicit recording step. Runs never silently refresh their trust pins."""
    target = HERE / 'sources-lock.json'
    if target.exists():
        raise RuntimeError('sources-lock.json exists; do not silently refresh pins')
    mapping = {'config_utils': '_bmad/scripts/config_utils.py', 'knowledge': '_bmad/scripts/knowledge.py',
               'roster': '_bmad/scripts/roster.py', 'resolve_config': '_bmad/scripts/resolve_config.py',
               'resolve_customization': '_bmad/scripts/resolve_customization.py',
               'setup_check': '_bmad/scripts/setup_check.py',
               'tickets': '.agents/skills/bmad-agent-po/scripts/tickets.py'}
    tools = [{'name': name, 'path': str(PROJECT / rel), 'sha256': digest(PROJECT / rel)} for name, rel in mapping.items()]
    copies = []
    for name in mapping:
        if name == 'tickets':
            continue
        a = PROJECT / mapping[name]
        b = PROJECT / '.agents/skills/bmad/scripts' / a.name
        copies.append({'name': name, 'source': str(a), 'copy': str(b), 'sha256': digest(a), 'identical': digest(a) == digest(b)})
    runtime_tree = runtime.select_base(Path(sys.executable), PROJECT)
    uv = Path(os.environ['G2_UV'])
    if digest(uv) != runtime.UV_PIN:
        raise ValueError('UV_CHANGED')
    target.write_text(json.dumps({'schema': 1, 'version': sys.version, 'tools': tools, 'copies': copies,
                                  'runtime': runtime_tree, 'uv': {'path': str(uv), 'sha256': digest(uv)},
                                  'preservation_before': preservation()}, indent=2), encoding='utf-8')

class Fixture:
    def __init__(self):
        self.root = HERE / ('fixtures-run-' + uuid.uuid4().hex)
        self.root.mkdir()

    def put(self, relative, text):
        path = self.root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(text if isinstance(text, bytes) else text.encode('utf-8'))
        return path

    def project(self, name='project', *, version='6.13.0-next'):
        self.put(name + '/_bmad/config.toml', '[core]\noutput_folder="{project-root}/_bmad-output"\n')
        self.module(name + '/.agents/skills', version=version)
        return self.root / name

    def module(self, root, *, folder='bmod-sample', skill='sample', version='6.13.0-next', extra=''):
        self.put(root + '/' + folder + '/bmod.toml', '[bmod]\ncode="sample"\nversion="' + version + '"\nskills=["' + skill + '"]\n' + extra)
        self.put(root + '/' + folder + '/help/help.md', '# Sample module\nUse the installed sample skill.\n')
        self.put(root + '/' + skill + '/bmod.toml', '[skill]\nbmod="' + folder + '"\n')
        self.put(root + '/' + skill + '/SKILL.md', '---\nname: ' + skill + '\ndescription: sample\n---\n# Sample\n')
        self.put(root + '/' + skill + '/customize.toml', '[agent]\nname="Default"\n')
        return self.root / root

    def cleanup(self):
        target = Path(os.path.abspath(self.root))
        if target.parent != HERE or not target.name.startswith('fixtures-run-') or self.root.is_symlink():
            raise RuntimeError('cleanup scope not owned')
        # Python >=3.8 removes Windows junctions without traversing their target.
        shutil.rmtree(target)
        return not target.exists()

if __name__ == '__main__':
    if sys.argv[1:] != ['--record-pins']:
        raise SystemExit('Only --record-pins is supported')
    bootstrap()
