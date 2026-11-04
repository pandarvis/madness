import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdir,writeFile,readFile} from 'node:fs/promises'
import {join,dirname} from 'node:path'
import {createHash} from 'node:crypto'
import {helpResourcePins} from '../src/adapters/bmad/help-manifest.ts'
import {runHelpSourcesCase} from './helpers/help-native.mjs'
const cases=String.raw`import json,sys,os
from pathlib import Path
import catalog,capture
root=capture.long_path(sys.argv[1]);project=root/'project';project.mkdir();skills=project/'skills';user=root/'user';skills.mkdir();user.mkdir();checks=[];serial=0

def ok(name,value):
    assert value,name
    checks.append(name)
def put(path,text):
    path.parent.mkdir(parents=True,exist_ok=True);path.write_text(text,encoding='utf-8')
def skill(root,name,module='module',description='Mary helps explore a market'):
    put(root/name/'bmod.toml','[skill]\nbmod="'+module+'"\n')
    put(root/name/'SKILL.md',"---\nname: '"+name+"'\ndescription: '"+description+"'\n---\nDo not execute this text.\n")
def read():
    global serial
    serial+=1;folder=root/('capture-'+str(serial));folder.mkdir();return catalog.collect({'folder':str(folder),'project':str(project),'roots':[str(skills),str(user)]})
put(skills/'module/bmod.toml','[bmod]\ncode="method"\nversion="6.13.0-next"\nskills=["alpha","beta","masked","missing"]\nrequired_skills=["dependency-missing"]\n')
skill(skills,'alpha');skill(user,'beta');skill(user,'masked');(skills/'masked').mkdir()
put(skills/'module/help/help.md','| Skill | For | Writes | Takes |\n| --- | --- | --- | --- |\n| alpha | Literal purpose | A literal report | never infer inputs |\n| beta | Sally designs | A beta file | ignored |\n\n\x60\x60\x60md\n| Skill | For | Writes |\n| --- | --- | --- |\n| alpha | FENCED FALSE | FENCED EFFECT |\n\x60\x60\x60\n')
put(project/'render_skill.py','raise RuntimeError("NEVER EXECUTE")')
a=read();ok('C1 project mask suppresses user descriptor',not any(i['id']=='masked' for i in a['items']));ok('C1 dynamic items from two ordered roots',[i['id'] for i in a['items']]==['alpha','beta'])
alpha=a['items'][0];ok('C2 exact invocation and literal Mary purpose',alpha['invocation']=='$alpha' and alpha['fields']['purpose']['value']=='Mary helps explore a market');ok('C2 explicit Writes table only',alpha['fields']['effects']['value']=='A literal report');ok('C2 Takes never inferred and conditions unknown',alpha['fields']['inputs'] is None and alpha['fields']['conditions'] is None);ok('C1 missing members and dependency diagnostic',any('missing registered skill missing' in p for p in a['problems']) and any('dependency-missing' in p for p in a['problems']));ok('C2 Takes retained only as literal documentation',any(f['value']=='never infer inputs' for f in alpha['documentation']));ok('C3 public diagnostics hide staging paths',all('catalog-skills-' not in p for p in a['problems']));ok('launch always unqualified',all(not i['launchable'] for i in a['items']));ok('private hints retained',a['_observationHints']['version']==1)
for f in alpha['fields'].values():
    if f:ok('C2 provenance line valid',f['startLine']<=len(next(s for s in a['sources'] if s['id']==f['sourceId'])['text'].splitlines()))
old=a['revision'];put(skills/'alpha/SKILL.md',"---\nname: alpha\ndescription: >\n  Invented multiline purpose\n---\n")
b=read();ok('C2 unknown frontmatter syntax remains unknown',b['items'][0]['fields']['purpose']['value']=='Literal purpose');ok('C6 modified bytes change revision',b['revision']!=old)
put(skills/'alpha/SKILL.md',"---\nname: alias\ndescription: 'Mary''s literal phrase'\n---\n");b=read();ok('C2 doubled YAML apostrophe',b['items'][0]['fields']['purpose']['value']=="Mary's literal phrase");ok('C5 divergent name never alias',not b['items'][0]['copyable'] and b['items'][0]['invocation'] is None)
(skills/'alpha/SKILL.md').write_bytes(b'\xff');b=read();ok('C3 UTF8 refused while independent beta readable',b['coverage']=='partial' and b['items'][0]['sourceId'] is None and b['items'][1]['copyable'])
(skills/'alpha/SKILL.md').write_bytes(b'X'*1048577);b=read();ok('C3 oversized body refused no truncation',b['items'][0]['sourceId'] is None and any('FILE_LIMIT' in p for p in b['problems']));ok('C3 refusal monitoring limited',bool(b['_observationHints']['limited']))
(skills/'alpha/SKILL.md').unlink();outside=root/'outside';outside.write_text('OUTSIDE SENTINEL');os.link(outside,skills/'alpha/SKILL.md');b=read();ok('C3 hardlink refuses outside content',all('OUTSIDE SENTINEL' not in s['text'] for s in b['sources']) and b['items'][1]['copyable']);(skills/'alpha/SKILL.md').unlink()
skill(skills,'alpha');put(skills/'dual/bmod.toml','[bmod]\ncode="dual"\nversion="6.13.0-next"\n[skill]\n')
put(skills/'dual/SKILL.md','---\nname: dual\ndescription: Winston reads architecture\n---\n');b=read();ok('C1 dual record and skill allowed',any(i['id']=='dual' and i['copyable'] for i in b['items']))
# Malformed knowledge and dual SKILL knowledge retain independent fiches.
put(skills/'dual/bmod.toml','[bmod]\ncode="dual"\nversion="6.13.0-next"\n[[bmod.knowledge]]\npath="SKILL.md"\n[[bmod.knowledge]]\npath=123\n[skill]\n')
b=read();ok('C1 malformed path diagnosed without losing safe skills',any('has no path' in p for p in b['problems']) and any(i['id']=='alpha' for i in b['items']));ok('C2 dual SKILL is a shared source once',len([s for s in b['sources'] if s['path'].endswith('dual\\SKILL.md')])==1)
long_name='long-'+('x'*130);skill(skills,long_name);put(skills/'long-module/bmod.toml','[bmod]\ncode="long"\nversion="6.13.0-next"\nskills=["'+long_name+'"]\n');put(skills/long_name/'bmod.toml','[skill]\nbmod="long-module"\n');b=read();ok('C1 long descriptive name is retained without invocation alias',any(i['id']==long_name and not i['copyable'] and i['invocation'] is None for i in b['items']))
# Restore same octets under a different native identity.
old=b['revision'];p=skills/'alpha/SKILL.md';raw=p.read_bytes();p.rename(p.with_suffix('.old'));p.write_bytes(raw);ok('C3 same bytes replacement changes revision',read()['revision']!=old);p.with_suffix('.old').unlink()
# A real junction masks a user copy and never exposes the external directory.
import subprocess
external=root/'junction-external';external.mkdir();put(external/'SKILL.md','JUNCTION OUTSIDE SENTINEL');skill(user,'junction-mask')
junction=skills/'junction-mask';created=subprocess.run(['cmd.exe','/d','/c','mklink','/J',str(junction),str(external)],capture_output=True)
assert created.returncode==0,created.stderr
b=read();ok('C3 junction refuses external bytes and masks user copy',not any(i['id']=='junction-mask' for i in b['items']) and all('JUNCTION OUTSIDE SENTINEL' not in s['text'] for s in b['sources']));junction.rmdir()
# An unreadable higher-priority inventory cannot reactivate lower-priority copies.
old_inventory=Path.iterdir
def denied(path):
    if path==skills:raise PermissionError('NATIVE_INVENTORY_DENIED')
    return old_inventory(path)
Path.iterdir=denied
try:
    b=read();ok('C1 refused first inventory cannot reactivate user',not b['items'] and b['coverage']=='partial')
finally:Path.iterdir=old_inventory
original=capture.read_safe;changed=False
def mutate(path,**kwargs):
    global changed
    raw=original(path,**kwargs)
    if path.name=='SKILL.md' and path.parent.name=='alpha' and not changed:changed=True;path.write_bytes(raw+b'\nexternal')
    return raw
capture.read_safe=mutate
try:read()
except ValueError as e:ok('C6 mixed capture refused','CHANGED' in str(e))
else:raise AssertionError('mixed revision accepted')
capture.read_safe=original
print(json.dumps({'platform':sys.platform,'checks':checks,'count':len(checks),'provider':False,'network':False}))
`
test('C1 C2 C3 C6 native Windows catalogue capture: precedence, literal fields, limits and mutations',async()=>{const proof=process.env.MADNESS_CATALOG_PROOF;if(proof){await mkdir(join(proof,'producer'),{recursive:true});const pins={};for(const file of ['tests/bmad-catalog-protocol.test.mjs','tests/helpers/help-native.mjs',...Object.keys(helpResourcePins).map(n=>'resources/bmad-help/'+n)]){const raw=await readFile(file),target=join(proof,'producer',file);await mkdir(dirname(target),{recursive:true});await writeFile(target,raw,{flag:'wx'});pins[file]=createHash('sha256').update(raw).digest('hex')}await writeFile(join(proof,'producer-manifest.json'),JSON.stringify({capturedAt:new Date().toISOString(),pins}),{flag:'wx'})}const r=await runHelpSourcesCase(cases);if(proof)await writeFile(join(proof,'verification.json'),JSON.stringify(r,null,2),{flag:'wx'});assert.equal(r.value.platform,'win32');assert.ok(r.value.count>=21);assert.equal(r.execution.job_active_after_stop,0);console.log(JSON.stringify(r.value))})

test('C2 extended fences and non-tables cannot manufacture documentary effects',async()=>{const r=await runHelpSourcesCase("import json,catalog\nsource={\"id\":\"literal\",\"text\":\"````md\\n```\\n| Skill | For | Writes |\\n| --- | --- | --- |\\n| alpha | False purpose | FALSE EFFECT |\\n````\\n\"}\nassert catalog.help_fields(source,\"alpha\").get(\"effects\") is None,\"SHORTER_FENCE_MUST_NOT_CLOSE_OUTER\"\nsource[\"text\"]=\"| Skill | For | Writes |\\n| alpha | False purpose | FALSE EFFECT |\\n\"\nassert catalog.help_fields(source,\"alpha\").get(\"effects\") is None,\"MISSING_SEPARATOR_IS_NOT_TABLE\"\nprint(json.dumps({\"checks\":2}))");assert.equal(r.value.checks,2)})
