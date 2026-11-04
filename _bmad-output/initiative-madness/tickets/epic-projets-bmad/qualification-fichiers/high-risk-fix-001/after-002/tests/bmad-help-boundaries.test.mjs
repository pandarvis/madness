import test from 'node:test'
import assert from 'node:assert/strict'
import {runHelpSourcesCase} from './helpers/help-native.mjs'
const cases=String.raw`import json,os,shutil,sys,subprocess
from pathlib import Path
import worker,capture,runtime_guard
root=Path(sys.argv[1]);checks=[]
def ok(name,condition):
    assert condition,name
    checks.append(name)
def refused(name,fn):
    try:fn()
    except (OSError,ValueError):checks.append(name);return
    raise AssertionError('not refused: '+name)
def project(name):
    p=capture.long_path(root/name);s=p/'.agents/skills';(s/'bmod-test/help').mkdir(parents=True);(s/'bmad/references').mkdir(parents=True);(p/'_bmad').mkdir()
    (s/'bmod-test/bmod.toml').write_text('[bmod]\ncode="test"\nversion="6.13.0-next"\nskills=["bmad"]\n',encoding='utf-8')
    (s/'bmod-test/help/help.md').write_text('Use installed skills only.\n',encoding='utf-8')
    (s/'bmad/bmod.toml').write_text('[skill]\nbmod="bmod-test"\n',encoding='utf-8')
    (s/'bmad/SKILL.md').write_bytes((Path(worker.__file__).parent/'bmad-SKILL.md').read_bytes())
    (s/'bmad/references/help.md').write_bytes((Path(worker.__file__).parent/'bmad-help.md').read_bytes())
    (p/'_bmad/config.toml').write_text('[core]\noutput_folder="{project-root}/_bmad-output"\n',encoding='utf-8')
    return p,s
def prepare(p,s,name):
    out=root/name;out.mkdir()
    return worker.prepare({'project':str(p),'roots':[str(s)],'folder':str(out)}),out
p,s=project('reference')
b,prepared=prepare(p,s,'snapshot-reference')
ok('native exact main loads help',len(b['documents'])==1 and b['nativeReady'])
ok('raw native snapshot paths preserved',str(capture.long_path(prepared/'skills-0')) in json.loads(b['knowledgeRaw'])['roots'])
(p/'_bmad/config.user.toml').write_text('INVALID ignored root layer',encoding='utf-8')
worker.fresh(prepared);ok('noncentral config.user ignored',True)
(p/'_bmad/config.toml').write_text('[broken',encoding='utf-8')
refused('fresh config mutation refuses',lambda:worker.fresh(prepared))
bad,_=prepare(p,s,'snapshot-bad-config')
ok('bad config preserves independent help',len(bad['documents'])==1 and not bad['nativeReady'] and bool(bad['problems']))
(p/'_bmad/config.toml').write_text('[core]\noutput_folder="{project-root}/_bmad-output"\nactive_initiative="initiative-missing"\n',encoding='utf-8')
(p/'_bmad-output/initiative-missing/tickets/epic-missing').mkdir(parents=True)
missing,_=prepare(p,s,'snapshot-missing-context')
ok('missing initiative and epic preserve help but block native',len(missing['documents'])==1 and not missing['nativeReady'] and any('Contexte' in x for x in missing['problems']))
(p/'_bmad-output/initiative-missing/initiative-missing.md').write_bytes(b'\xff')
(p/'_bmad-output/initiative-missing/tickets/epic-missing/epic-missing.md').write_text('Epic data',encoding='utf-8')
invalid,_=prepare(p,s,'snapshot-invalid-context')
ok('invalid utf8 context is visible refusal',len(invalid['documents'])==1 and not invalid['nativeReady'] and any('Contexte' in x for x in invalid['problems']))
(p/'_bmad-output/initiative-missing/initiative-missing.md').write_text('Whole initiative data',encoding='utf-8')
good,_=prepare(p,s,'snapshot-good-context')
ok('whole initiative and epic captured',good['nativeReady'] and any(x['text']=='Whole initiative data' for x in good['sources']) and any(x['text']=='Epic data' for x in good['sources']))
# Missing/unknown profiles remain diagnostics with independent module documents.
(p/'_bmad/config.user.toml').unlink()
(p/'_bmad/config.toml').unlink()
absent,_=prepare(p,s,'snapshot-absent')
ok('BMad config absent independent help',absent['diagnostic']=='absent' and len(absent['documents'])==1 and not absent['nativeReady'])
(p/'_bmad/config.toml').write_text('[core]\n',encoding='utf-8')
(s/'bmod-test/bmod.toml').write_text('[bmod]\ncode="test"\nversion="99"\nskills=["bmad"]\n',encoding='utf-8')
unknown,_=prepare(p,s,'snapshot-unknown')
ok('unknown version never launches',unknown['diagnostic']=='unknown' and len(unknown['documents'])==1 and not unknown['nativeReady'])
outside=root/'outside';outside.mkdir();target=outside/'marker.md';target.write_text('EXTERNAL EXACT',encoding='utf-8');before=target.read_bytes()
hard=root/'hard.md';os.link(target,hard)
refused('native Windows hardlink refused before read',lambda:capture.read_safe(hard))
hard.unlink()
junction=root/'junction'
result=subprocess.run(['cmd.exe','/d','/c','mklink','/J',str(junction),str(outside)],capture_output=True)
assert result.returncode==0,result.stderr
refused('native Windows junction ancestor refused',lambda:capture.read_safe(junction/'marker.md'))
os.rmdir(junction)
parent=root/'race-parent';parent.mkdir();(parent/'marker.md').write_text('SAFE',encoding='utf-8');moved=root/'race-moved'
def replace_parent():
    parent.rename(moved)
    result=subprocess.run(['cmd.exe','/d','/c','mklink','/J',str(parent),str(outside)],capture_output=True)
    assert result.returncode==0
refused('handle revalidation rejects replaced ancestor',lambda:capture.read_safe(parent/'marker.md',before_open=replace_parent))
os.rmdir(parent)
ok('external Windows witness remains exact',target.read_bytes()==before)
refused('output traversal refused',lambda:capture.confined_output(p,'../outside'))
refused('external output refused',lambda:capture.confined_output(p,str(outside)))
runtime=Path(sys.executable).parent;manifest=json.loads((Path(worker.__file__).parent/'runtime.json').read_text(encoding='utf-8'))
for rel in ['Lib/site-packages/sitecustomize.py','Lib/__pycache__/bad.pyc','extra-empty/.marker','pyvenv.cfg']:
    path=runtime/rel;path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(b'NEVER_EXECUTE')
    refused('closed runtime refuses '+rel,lambda:runtime_guard.closed_manifest(runtime,manifest['files']))
    path.unlink()
    if path.parent.name in ('__pycache__','extra-empty'):path.parent.rmdir()
ok('closed runtime valid after owned variant cleanup',runtime_guard.closed_manifest(runtime,manifest['files'])['sha256']==runtime_guard.TREE_PIN)
pem=runtime/'Lib/codex-rejected-cas.pem';guard_data=pem.read_bytes()
pem.unlink()
refused('closed runtime refuses missing TLS guard data',lambda:runtime_guard.closed_manifest(runtime,manifest['files']))
pem.write_bytes(guard_data+b'changed')
refused('closed runtime refuses altered TLS guard data',lambda:runtime_guard.closed_manifest(runtime,manifest['files']))
pem.write_bytes(guard_data)
ok('qualified TLS guard restored exact and runtime closed',len(manifest['files'])==735 and capture.sha(guard_data)=='c916ce1b14ed8ca69e9b5c9fab22799a900dd610d6d4ec9b1347f4fd48e53718' and runtime_guard.closed_manifest(runtime,manifest['files'])['sha256']==runtime_guard.TREE_PIN)
p,s=project('long-reference')
out=capture.long_path(root/('long-snapshot-'+'x'*180));out.mkdir()
long_bundle=worker.prepare({'project':str(p),'roots':[str(s)],'folder':str(out)})
ok('native snapshot over MAX_PATH stays complete',long_bundle['nativeReady'] and any(len(x['snapshot'])>260 for x in long_bundle['sources']))
print(json.dumps({'checks':checks,'count':len(checks),'platform':sys.platform,'symlink_file':'not exercised: Windows privilege not requested'}))
`
test('real product sources preserve partial help and reject Windows path/runtime boundary variants',async()=>{const result=await runHelpSourcesCase(cases);assert.equal(result.value.platform,'win32');assert.ok(result.value.count>=20);assert.equal(result.execution.job_active_after_stop,0);assert.deepEqual(result.preflight,['sitecustomize','cache','parent-venv']);console.log(JSON.stringify(result.value))})
