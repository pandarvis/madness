import test from 'node:test'
import assert from 'node:assert/strict'
import {runHelpSourcesCase} from './helpers/help-native.mjs'
const cases=String.raw`import json,os,subprocess,sys
from pathlib import Path
import worker,capture
root=capture.long_path(sys.argv[1]);checks=[];serial=0
def ok(name,value):
    assert value,name
    checks.append(name)
def refused(name,fn):
    try:fn()
    except (OSError,ValueError):checks.append(name);return
    raise AssertionError('not refused: '+name)
p=root/'project';p.mkdir();s=p/'.agents/skills';s.mkdir(parents=True)
def observe():
    global serial
    serial+=1;folder=root/('snapshot-'+str(serial));folder.mkdir()
    return worker.context_observation({'project':str(p),'roots':[str(s)],'folder':str(folder)}),folder
def config(value):
    (p/'_bmad').mkdir(exist_ok=True)
    (p/'_bmad/config.toml').write_text(value,encoding='utf-8')
def md(name,text='# source'):
    folder=p/'_bmad-output'/name;folder.mkdir(parents=True,exist_ok=True);(folder/(name+'.md')).write_text(text,encoding='utf-8')
absent,_=observe();ok('absent does not invent initiative',absent['status']=='absent' and absent['activeStatus']=='absent' and not absent['initiatives'])
(p/'_bmad/_config').mkdir(parents=True);(p/'_bmad/_config/manifest.yaml').write_text('legacy presence only',encoding='utf-8')
legacy,_=observe();ok('legacy presence remains distinct',legacy['status']=='legacy-observed')
config('[core]\noutput_folder="{project-root}/_bmad-output"\nactive_initiative="alpha"\n')
md('alpha');md('beta')
(s/'bmod-test').mkdir();(s/'bmod-test/bmod.toml').write_text('[bmod]\ncode="test"\nversion="99"\n',encoding='utf-8')
unknown,_=observe();ok('unknown version permits data consultation only',unknown['status']=='unknown' and len(unknown['initiatives'])==2)
(s/'bmod-test/bmod.toml').write_text('[bmod]\ncode="test"\nversion="6.13.0-next"\n',encoding='utf-8')
(p/'_bmad/config_utils.py').write_text('raise RuntimeError("PROJECT MUST NEVER EXECUTE")',encoding='utf-8')
base,receipt=observe();ok('exact active and immediate initiatives',base['activeInitiative']=='alpha' and base['activeStatus']=='valid' and [i['id'] for i in base['initiatives']]==['alpha','beta'])
worker.fresh(receipt)
def configuration():
    global serial
    serial+=1;folder=root/('configuration-'+str(serial));folder.mkdir()
    return worker.context_observation({'project':str(p),'roots':[str(s)],'folder':str(folder)},True),folder
scoped,scoped_receipt=configuration()
alpha_source=p/'_bmad-output/alpha/alpha.md';alpha_source.rename(alpha_source.with_suffix('.missing'))
independent,_=configuration()
ok('configured alpha captured without its document',independent['activeInitiative']=='alpha' and independent['activeStatus']=='valid' and 'initiatives' not in independent)
alpha_source.with_suffix('.missing').rename(alpha_source)
original_listing=worker.listing
def forbid_output(path,all_names=False):
    if path.is_relative_to(p/'_bmad-output'):raise AssertionError('configuration scope inventoried output')
    return original_listing(path,all_names)
worker.listing=forbid_output
independent,_=configuration()
ok('configuration scope never reads or inventories outputs',independent['revision']==scoped['revision'] and all('_bmad-output' not in source['path'] for source in independent['sources']))
worker.listing=original_listing
md('unrelated',text='temporary')
(p/'_bmad-output/unrelated/unrelated.md').write_bytes(b'\xff')
independent,_=configuration();worker.fresh(scoped_receipt)
ok('unrelated refused document leaves configuration capture fresh',independent['revision']==scoped['revision'])
refused('full discovery still refuses unrelated invalid document',observe)
(p/'_bmad-output/unrelated/unrelated.md').unlink();(p/'_bmad-output/unrelated').rmdir()
alpha=p/'_bmad-output/alpha/alpha.md';old=alpha.read_bytes();alpha.rename(alpha.with_suffix('.old'));alpha.write_bytes(old)
refused('same-byte file replacement invalidates receipt',lambda:worker.fresh(receipt))
changed,_=observe();ok('file identity participates in revision',changed['revision']!=base['revision'])
(p/'_bmad/custom').mkdir();(p/'_bmad/custom/config.toml').write_text('[core]\nactive_initiative="beta"\n',encoding='utf-8');(p/'_bmad/custom/config.user.toml').write_text('[core]\nactive_initiative="alpha"\n',encoding='utf-8')
layers,_=observe();ok('three configuration layers resolved from captured bytes',layers['activeInitiative']=='alpha' and all(any(x['path'].endswith(rel) for x in layers['sources']) for rel in ['config.toml','config.user.toml']))
(p/'_bmad/custom/config.toml').unlink();(p/'_bmad/custom/config.user.toml').unlink()
md('nom non représentable')
unrepresented,_=observe();ok('unrepresentable name never becomes slug',any(i['name']=='nom non représentable' and i['id'] is None for i in unrepresented['initiatives']))
config('[core]\nactive_initiative="nom non représentable"\n')
invalid,_=observe();ok('invalid active remains explicit',invalid['activeStatus']=='invalid')
for label,value in [('traversal','../outside'),('external',capture.display_path(root/'outside')),('ADS','{project-root}/_bmad-output:stream')]:
    config('[core]\noutput_folder='+json.dumps(value)+'\n')
    v,_=observe();ok(label+' output refused',v['status']=='incompatible' and not v['initiatives'])
# Internal absolute path remains admitted by the G2 policy.
config('[core]\noutput_folder='+json.dumps(capture.display_path(p/'_bmad-output'))+'\nactive_initiative="alpha"\n')
absolute,_=observe();ok('internal absolute output admitted',absolute['activeStatus']=='valid' and len(absolute['initiatives'])==3)
config('[core]\noutput_folder="{project-root}/_bmad-output"\nactive_initiative="alpha"\n')
native_fresh=worker.fresh
def during_collect(folder):
    config('[core]\nactive_initiative="beta"\n')
    return native_fresh(folder)
worker.fresh=during_collect
refused('config mutation during collection rejects mixed observation',observe)
worker.fresh=native_fresh
config('[core]\nactive_initiative="alpha"\n')
alpha.write_bytes(b'\xff');refused('invalid UTF8 initiative refused',observe);alpha.write_bytes(old)
outside=root/'outside.md';outside.write_text('EXTERNAL EXACT',encoding='utf-8')
alpha.unlink();os.link(outside,alpha);refused('real hardlink initiative refused',observe);alpha.unlink();alpha.write_bytes(old)
junction=p/'_bmad-output/junction'
r=subprocess.run(['cmd.exe','/d','/c','mklink','/J',str(junction),str(root)],capture_output=True)
assert r.returncode==0
refused('real junction initiative refused',observe);os.rmdir(junction)
ok('external witness unchanged',outside.read_text(encoding='utf-8')=='EXTERNAL EXACT')
alpha.write_bytes(b'A'*1048577);refused('per-file bound refused without truncation',observe);alpha.write_bytes(old)
for i in range(17):md('volume-'+str(i),'A'*1048576)
refused('aggregate corpus bound refused',observe)
for i in range(17):
    path=p/'_bmad-output'/('volume-'+str(i));(path/(path.name+'.md')).unlink();path.rmdir()
for i in range(1025):(s/('entry-'+str(i))).mkdir()
refused('immediate inventory count bound refused',observe)
print(json.dumps({'platform':sys.platform,'count':len(checks),'checks':checks,'symlinkFile':'not exercised: Windows privilege limit'}))
`
test('context sources: real Windows receipts, mutations, absent/unknown, identity, three layers and boundaries',async()=>{
 const result=await runHelpSourcesCase(cases)
 assert.equal(result.value.platform,'win32');assert.ok(result.value.count>=18)
 assert.equal(result.execution.job_active_after_stop,0)
 assert.deepEqual(result.preflight,['sitecustomize','cache','parent-venv'])
 console.log(JSON.stringify(result.value))
})
