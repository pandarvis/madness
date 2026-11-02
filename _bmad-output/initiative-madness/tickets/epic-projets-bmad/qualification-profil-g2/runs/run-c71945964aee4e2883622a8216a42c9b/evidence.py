"""Create-only execution receipts; verify never refreshes or writes a seal."""
import hashlib
import json
from pathlib import Path
import uuid

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def create_run(base):
    path = base / ('run-' + uuid.uuid4().hex)
    path.mkdir(parents=True, exist_ok=False)
    return path

def seal(run, names):
    manifest = {'schema': 2, 'sha256': {n:digest(run / n) for n in names}}
    with (run / 'evidence-manifest.json').open('x', encoding='utf-8') as stream:
        json.dump(manifest, stream, indent=2)
    return manifest

def verify(run):
    manifest = json.loads((run / 'evidence-manifest.json').read_text(encoding='utf-8'))
    if any(Path(n).is_absolute() or '..' in Path(n).parts for n in manifest['sha256']):
        raise ValueError('EVIDENCE_PATH')
    if manifest['sha256'] != {n:digest(run / n) for n in manifest['sha256']}:
        raise ValueError('EVIDENCE_CHANGED')
    return manifest
