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

class Fixture:
    counter = 0
    def __init__(self):
        owner = Path(os.environ['G2_FIXTURE_ROOT'])
        if owner.parent != HERE or not owner.name.startswith('fixtures-run-'):
            raise ValueError('FIXTURE_OWNER')
        runtime.chain(owner)
        Fixture.counter += 1
        # Run UUID already owns the namespace; short child names avoid the
        # measured MAX_PATH failure on deep installed skill test directories.
        self.root = owner / ('c' + str(Fixture.counter))
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
        if target.parent != Path(os.environ['G2_FIXTURE_ROOT']) or not (target.name.startswith('c') and target.name[1:].isdigit()) or self.root.is_symlink():
            raise RuntimeError('cleanup scope not owned')
        # Python >=3.8 removes Windows junctions without traversing their target.
        shutil.rmtree(target)
        return not target.exists()

