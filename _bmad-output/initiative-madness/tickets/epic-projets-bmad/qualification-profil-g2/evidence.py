"""Bounded, source-independent receipt reader; no receipt field is a path."""
import hashlib
import json
from pathlib import Path
import uuid
import prototype as p

BENCH = frozenset(['prototype.py','fixtures.py','scenarios.py','runtime_guard.py','evidence.py','verify.py',
                  'run.ps1','runtime-preflight.ps1','preflight-probe.ps1','source_bootstrap.py',
                  'supervision.ps1','supervision-probe.ps1'])
ARTIFACTS = BENCH | frozenset(['sources-lock.json','results.json','inventory-local.json','context-local.json',
    'tickets-local.json','tickets-conflict.json','scenarios.log','calls.log','execution.json',
    'launcher.stdout.log','launcher.stderr.log','supervision-probe.stdout.log','supervision-probe.stderr.log',
    'evidence-manifest.json'])
COUNT_LIMIT = 64
TOTAL_LIMIT = 16 * 1024 * 1024

def allowed(name, names=ARTIFACTS):
    if not isinstance(name,str) or name not in names:
        raise p.Refusal('EVIDENCE_NAME',str(name))
    return name

def validate_records(value):
    if 'bench' in value:
        if not isinstance(value['bench'],dict) or len(value['bench']) > len(BENCH):
            raise p.Refusal('EVIDENCE_RECORDS')
        for name, digest_value in value['bench'].items():
            allowed(name,BENCH)
            valid_digest(digest_value)

def valid_digest(value):
    if not isinstance(value,str) or len(value)!=64 or any(c not in '0123456789abcdef' for c in value):
        raise p.Refusal('EVIDENCE_HASH')

def snapshot(run, names=ARTIFACTS):
    """Preflight the WHOLE immediate directory before any artifact content read.

    All later branches consume these captured bytes, including failed/unsealed
    schema1/2/3. No is_file filter that silently skips links or directories.
    """
    p.inspect_chain(run)
    paths = []
    size = 0
    for path in run.iterdir():
        if len(paths) >= COUNT_LIMIT:
            raise p.Refusal('EVIDENCE_COUNT')
        allowed(path.name,names)
        p.inspect_chain(path)
        info = path.lstat()
        if not path.is_file():
            raise p.Refusal('EVIDENCE_TYPE')
        limit = 4*1024*1024 if path.suffix=='.log' else p.FILE_LIMIT
        if info.st_size>limit:
            raise p.Refusal('EVIDENCE_SIZE')
        size += info.st_size
        if size>TOTAL_LIMIT:
            raise p.Refusal('EVIDENCE_TOTAL')
        paths.append((path,limit))
    result = {path.name:p.read_safe(path,file_limit=limit,utf8=False) for path,limit in paths}
    if set(result) != {path.name for path in run.iterdir()}:
        raise p.Refusal('EVIDENCE_CHANGED')
    if 'sources-lock.json' in result:
        validate_records(json.loads(result['sources-lock.json']))
    if 'evidence-manifest.json' in result:
        manifest=json.loads(result['evidence-manifest.json'])
        if not isinstance(manifest.get('sha256'),dict) or len(manifest['sha256'])>COUNT_LIMIT:
            raise p.Refusal('EVIDENCE_RECORDS')
        for name, value in manifest['sha256'].items():
            allowed(name,names)
            valid_digest(value)
    return result

def digest(path):
    return p.sha(p.read_safe(Path(path),file_limit=4*1024*1024,utf8=False))

def create_run(base):
    p.inspect_chain(base,missing=True)
    base.mkdir(parents=True,exist_ok=True)
    p.inspect_chain(base)
    path = base / ('run-' + uuid.uuid4().hex)
    path.mkdir(exist_ok=False)
    p.inspect_chain(path)
    return path

def seal(run, names):
    captured = snapshot(run)
    manifest = {'schema':5,'sha256':{allowed(n):p.sha(captured[n]) for n in names}}
    p.inspect_chain(run)
    with (run/'evidence-manifest.json').open('x',encoding='utf-8') as stream:
        json.dump(manifest,stream,indent=2)
    return manifest

def verify(run, captured=None):
    captured = captured if captured is not None else snapshot(run)
    manifest = json.loads(captured['evidence-manifest.json'])
    for name in manifest['sha256']:
        allowed(name)
    if manifest['sha256'] != {name:p.sha(captured[name]) for name in manifest['sha256']}:
        raise p.Refusal('EVIDENCE_CHANGED')
    return manifest