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
p,s=project('legacy-reference')
(p/'_bmad/config.toml').unlink()
absent,prepared=prepare(p,s,'snapshot-absent')
legacy_names=(
    '_bmad/_config/manifest.yaml','_bmad/_config/files-manifest.csv',
    '_bmad/_config/skill-manifest.csv','_bmad/_config/bmad-help.csv',
    '_bmad/config.user.toml','_bmad/core/config.yaml','_bmad/core/module-help.csv',
    '_bmad/core/v6-shims','_bmad/bmm/config.yaml','_bmad/bmm/module-help.csv','_bmad/bmm/v6-shims')
ok('only official v6 leftover markers are used',tuple(worker.LEGACY_MARKERS)==legacy_names)
legacy_paths=[]
for index,name in enumerate(legacy_names):
    marker=p/name;marker.parent.mkdir(parents=True,exist_ok=True)
    is_directory=name.endswith('/v6-shims')
    if is_directory:
        marker.mkdir();(marker/'must-not-run.py').write_text('raise RuntimeError("NEVER EXECUTE")',encoding='utf-8')
    else:marker.write_bytes(bytes([255])*(2*1024*1024 if index==0 else 1))
    legacy_paths.append((name,marker,is_directory))
    ok('official legacy presence observed without reading '+name,worker.legacy_presence(marker)['present'] is True)
refused('fresh detects official legacy marker appearance',lambda:worker.fresh(root/'snapshot-absent'))
legacy,legacy_snapshot=prepare(p,s,'snapshot-legacy-observed')
ok('legacy presence keeps independent help and refuses native',legacy['diagnostic']=='legacy-observed' and len(legacy['documents'])==1 and not legacy['nativeReady'])
observations=json.loads(capture.read_safe(legacy_snapshot/'capture.json',file_limit=4*1024*1024))['legacy']
ok('all eleven legacy observations are captured',len(observations)==11 and all(m['present'] is True for m in observations))
ok('legacy YAML CSV and shims content never loaded',not any(src['source'].endswith(name.replace('/','\\')) for name in legacy_names for src in legacy['sources']))
ok('oversized invalid UTF8 legacy body never read',not any(event.get('kind')=='read' and event.get('path')==str(legacy_paths[0][1]) for event in capture.EVENTS))
worker.fresh(legacy_snapshot)
for name,marker,is_directory in legacy_paths:
    if is_directory:(marker/'must-not-run.py').unlink();marker.rmdir()
    else:marker.unlink()
refused('fresh detects official legacy marker disappearance',lambda:worker.fresh(legacy_snapshot))

print(json.dumps({'checks':checks,'count':len(checks)}))
`
test('M2 official legacy markers are presence-only, independent and fresh on appearance or disappearance',async()=>{const result=await runHelpSourcesCase(cases);assert.equal(result.value.count,18);assert.equal(result.execution.job_active_after_stop,0);console.log(JSON.stringify(result.value))})
