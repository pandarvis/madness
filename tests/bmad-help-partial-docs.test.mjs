import test from 'node:test'
import assert from 'node:assert/strict'
import {runHelpSourcesCase} from './helpers/help-native.mjs'
const cases=String.raw`import json,sys
from pathlib import Path
import worker,capture,runtime_guard
root=capture.long_path(sys.argv[1]);checks=[]
def ok(name,value):
    assert value,name+" documents="+json.dumps(result.get("documents"))+" problems="+json.dumps(result.get("problems"))
    checks.append(name)
for variant in ('missing','invalid-utf8','oversized'):
    project=root/variant;skills=project/'.agents/skills'
    for name,code in [('bmod-safe','safe'),('bmod-bad','bad')]:
        folder=skills/name;(folder/'help').mkdir(parents=True)
        (folder/'bmod.toml').write_text('[bmod]\ncode="'+code+'"\nversion="6.13.0-next"\nskills=[]\nknowledge=[{path="help/help.md"}]\n',encoding='utf-8')
    (skills/'bmod-safe/help/help.md').write_bytes(b'Independent safe help exact.\n')
    bad=skills/'bmod-bad/help/help.md'
    if variant=='invalid-utf8':bad.write_bytes(b'\xff\xfe')
    if variant=='oversized':bad.write_bytes(b'x'*(1024*1024+1))
    (project/'_bmad').mkdir();(project/'_bmad/config.toml').write_text('[core]\n',encoding='utf-8')
    out=root/('snapshot-'+variant);out.mkdir()
    result=worker.prepare({'project':str(project),'roots':[str(skills)],'folder':str(out)})
    ok(variant+' preserves independent safe help',any(d['module']=='safe' and d['text']=='Independent safe help exact.\n' for d in result['documents']))
    ok(variant+' never presents bad help as loaded',not any(d['module']=='bad' for d in result['documents']))
    ok(variant+' has an explicit document diagnostic',any('help' in p and ('bad' in p or 'bmod-bad' in p) for p in result['problems']))
    ok(variant+' raw native JSON remains exact',json.loads(result['knowledgeRaw'])['documents'][0]['content']=='Independent safe help exact.\n')
    worker.fresh(out)
    if variant=='oversized':
        bad.write_bytes(b'now readable')
        try:worker.fresh(out)
        except (OSError,ValueError):checks.append('oversized refused source freshness retained')
        else:raise AssertionError('changed refused source accepted')
for variant in ('scalar-core','invalid-keyed-merge'):
    project=root/variant;skills=project/'.agents/skills';module=skills/'bmod-safe';(module/'help').mkdir(parents=True)
    (module/'bmod.toml').write_text('[bmod]\ncode="safe"\nversion="6.13.0-next"\nskills=[]\n',encoding='utf-8')
    (module/'help/help.md').write_bytes(b'Independent safe help exact.\n')
    central=project/'_bmad';central.mkdir()
    if variant=='scalar-core':(central/'config.toml').write_text('core="invalid"\n',encoding='utf-8')
    else:
        (central/'config.toml').write_text('[core]\nentries=[{id=1}]\n',encoding='utf-8')
        (central/'custom').mkdir();(central/'custom/config.toml').write_text('[core]\nentries=[{id=2}]\n',encoding='utf-8')
    out=root/('snapshot-'+variant);out.mkdir()
    result=worker.prepare({'project':str(project),'roots':[str(skills)],'folder':str(out)})
    ok(variant+' preserves independent safe help',any(d['module']=='safe' and d['text']=='Independent safe help exact.\n' for d in result['documents']))
    ok(variant+' refuses native configuration capability',not result['nativeReady'] and result['configRaw']=='')
    ok(variant+' retains an explicit configuration diagnostic',any(p.startswith('Configuration') for p in result['problems']))
    ok(variant+' preserves exact native help JSON',json.loads(result['knowledgeRaw'])['documents'][0]['content']=='Independent safe help exact.\n')
    worker.fresh(out);ok(variant+' keeps captured configuration fresh',True)
review_failures=[]
for variant in ('output-absent','skill-oversized','help-oversized'):
    try:
        project=root/variant;skills=project/'.agents/skills';module=skills/'bmod-safe';(module/'help').mkdir(parents=True)
        (module/'bmod.toml').write_text('[bmod]\ncode="safe"\nversion="6.13.0-next"\nskills=["bmad"]\n',encoding='utf-8')
        (module/'help/help.md').write_bytes(b'Independent safe help exact.\n')
        bmad=skills/'bmad';(bmad/'references').mkdir(parents=True)
        (bmad/'bmod.toml').write_text('[skill]\nbmod="bmod-safe"\n',encoding='utf-8')
        (bmad/'SKILL.md').write_bytes((Path(worker.__file__).parent/'bmad-SKILL.md').read_bytes())
        (bmad/'references/help.md').write_bytes((Path(worker.__file__).parent/'bmad-help.md').read_bytes())
        central=project/'_bmad';central.mkdir()
        active='active_initiative="initiative-required"\n' if variant=='output-absent' else ''
        (central/'config.toml').write_text('[core]\noutput_folder="{project-root}/_bmad-output"\n'+active,encoding='utf-8')
        primary=bmad/('SKILL.md' if variant=='skill-oversized' else 'references/help.md')
        if variant!='output-absent':primary.write_bytes(b'x'*(1024*1024+1))
        out=root/('snapshot-'+variant);out.mkdir()
        result=worker.prepare({'project':str(project),'roots':[str(skills)],'folder':str(out)})
        ok(variant+' preserves independent safe help',any(d['module']=='safe' and d['text']=='Independent safe help exact.\n' for d in result['documents']))
        ok(variant+' refuses native help capability',not result['nativeReady'])
        ok(variant+' has precise absence or size diagnostic',any(('Contexte' in p if variant=='output-absent' else 'FILE_LIMIT' in p and primary.name in p) for p in result['problems']))
        worker.fresh(out);ok(variant+' captured state stays fresh before changes',True)
        if variant=='output-absent':(project/'_bmad-output').mkdir()
        else:
            ok(variant+' primary oversized text never presented loaded',not any(src['source']==str(capture.display_path(primary)) for src in result['sources']))
            primary.write_bytes(b'now smaller')
        try:worker.fresh(out)
        except (OSError,ValueError):checks.append(variant+' appearance or refused source change invalidates capture')
        else:raise AssertionError('changed absent/refused source accepted')
    except Exception as error:review_failures.append({'variant':variant,'error':str(error)})
assert not review_failures,json.dumps(review_failures)
manifest=json.loads((Path(worker.__file__).parent/'runtime.json').read_text(encoding='utf-8'))
ok('qualified candidate has 735 exact runtime entries',len(manifest['files'])==735 and any(r['name']=='Lib/codex-rejected-cas.pem' and r['sha256']=='c916ce1b14ed8ca69e9b5c9fab22799a900dd610d6d4ec9b1347f4fd48e53718' for r in manifest['files']))
runtime=Path(sys.executable).parent
ok('qualified TLS guard is present unchanged',capture.sha(capture.read_safe(runtime/'Lib/codex-rejected-cas.pem',utf8=False))=='c916ce1b14ed8ca69e9b5c9fab22799a900dd610d6d4ec9b1347f4fd48e53718')
print(json.dumps({'checks':checks,'count':len(checks)}))
`
test('M2 partial documents and structurally invalid configuration retain independent safe help',async()=>{const result=await runHelpSourcesCase(cases);assert.equal(result.value.count,42);assert.equal(result.execution.job_active_after_stop,0);console.log(JSON.stringify(result.value))})