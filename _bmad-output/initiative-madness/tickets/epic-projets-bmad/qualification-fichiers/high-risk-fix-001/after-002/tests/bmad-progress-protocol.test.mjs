import test from 'node:test'
import assert from 'node:assert/strict'
import {runHelpSourcesCase} from './helpers/help-native.mjs'
const cases=String.raw`import json,os,sys
from pathlib import Path
import worker,capture,progress
root=capture.long_path(sys.argv[1]);project=root/'project';project.mkdir();skills=project/'.agents/skills';(skills/'bmod-test').mkdir(parents=True);(project/'_bmad').mkdir()
(skills/'bmod-test/bmod.toml').write_text('[bmod]\ncode="test"\nversion="6.13.0-next"\n',encoding='utf-8')
(project/'_bmad/config.toml').write_text('[core]\nactive_initiative="alpha"\n',encoding='utf-8')
(project/'_bmad/tickets.py').write_text('raise RuntimeError("PROJECT CODE EXECUTED")',encoding='utf-8')
for name in ('alpha','beta'):
    folder=project/'_bmad-output'/name;folder.mkdir(parents=True);(folder/(name+'.md')).write_text('# '+name+'\n\n## Decisions\nLiteral decision '+name+'\n',encoding='utf-8')
beta=project/'_bmad-output/beta';epic=beta/'tickets/epic-a';leaves=epic/'tickets';leaves.mkdir(parents=True)
(epic/'epic-a.md').write_text('---\ntype: epic\nstatus: in-progress\n---\n',encoding='utf-8')
(leaves/'tickets.toml').write_text('[[entry]]\nid=1\ntype="story"\ntitle="No leaf"\n[[entry]]\nid=2\ntype="story"\ntitle="Conflict"\n',encoding='utf-8')
(leaves/'story-conflict.md').write_text('---\ntype: story\nid: 2\ntitle: Conflict\nstatus: in-progress\ntracker_status: done\n---\n\n## Results\nLiteral <script>alert(1)</script>\n\n## Travail restant\nAgent proposes a follow-up.\n',encoding='utf-8')
(leaves/'story-conflict-plan.md').write_text('---\ntype: feature\nticket: 2\nstatus: built\n---\n\n## Decisions\nA proposal only.\n',encoding='utf-8')
(beta/'qualification-heavy').mkdir();(beta/'qualification-heavy/never-read.md').write_bytes(b'Z'*2097152)
checks=[];serial=0
def read():
    global serial
    serial+=1;folder=root/('snapshot-'+str(serial));folder.mkdir();req={'project':str(project),'roots':[str(skills)],'folder':str(folder)};context=worker.context_observation(req);req.update(initiativeId='beta',rootIdentity=context['rootIdentity'],contextRevision=context['revision']);return progress.collect(req,context)
def ok(name,value):
    assert value,name;checks.append(name)
value=read();ok('selected beta distinct from active alpha',value['initiativeId']=='beta' and all('/alpha/' not in s['path'].replace('\\','/') for s in value['sources']))
ok('no leaf entry remains visible',any(d['ticketId']=='1' and d['value']=='entry' for d in value['declarations']))
ok('three status declarations retained',sorted(d['value'] for d in value['declarations'] if d['ticketId']=='2' and d['field']!='existence')==['built','done','in-progress'])
ok('literal excerpts and exact lines',any(e['text']=='Literal <script>alert(1)</script>\r\n\r\n' and e['startLine']==10 for e in value['excerpts']))
ok('qualification never scanned',not any('qualification-heavy' in s['path'] for s in value['sources']))
for s in value['sources']:ok('hash '+s['id'],s['sha256']==capture.sha(Path(s['path']).read_bytes()))
old_revision=value['revision'];path=leaves/'story-conflict-plan.md';original=path.read_bytes();path.write_bytes(original+b'\n');ok('new bytes produce different revision',read()['revision']!=old_revision);path.write_bytes(original)
stem_plan=leaves/'another-name.md';stem_plan.write_text('---\nticket: story-conflict\nstatus: in-review\n---\n',encoding='utf-8');joined=read();ok('plan joins by leaf stem independent of filename',any(d['ticketId']=='2' and d['value']=='in-review' for d in joined['declarations']));ok('duplicate plans kept and named',any('Plans dupliques' in p for p in joined['problems']));stem_plan.unlink()
path.rename(path.with_suffix('.old'));path.write_bytes(original);replaced=read();ok('same byte replacement changes collection revision',replaced['revision']!=old_revision);path.with_suffix('.old').unlink()
invalid=leaves/'story-bad.md';invalid.write_bytes(b'\xff');partial=read();ok('invalid UTF8 explicit partial',partial['coverage']=='partial' and any('UTF8' in p for p in partial['problems']));invalid.unlink()
invalid.write_text('---\nid: 3\nstatus: built\n',encoding='utf-8');partial=read();ok('invalid frontmatter explicit partial',any('FRONTMATTER_UNCLOSED' in p for p in partial['problems']));invalid.unlink()
invalid.write_bytes(b'A'*1048577);ok('file bound no truncation',any('FILE_LIMIT' in p for p in read()['problems']));invalid.unlink()
outside=root/'outside.md';outside.write_text('OUTSIDE EXACT',encoding='utf-8');os.link(outside,invalid);ok('hardlink refusal no outside read',read()['coverage']=='partial' and outside.read_text()=='OUTSIDE EXACT');invalid.unlink()
(leaves/'tickets.toml').write_text('[[entry]\n',encoding='utf-8');ok('invalid TOML explicit partial',any('TOML invalide' in p for p in read()['problems']))
native_read=capture.read_safe;changed=False
def mutate(path,**kwargs):
    global changed
    raw=native_read(path,**kwargs)
    if path.name=='story-conflict.md' and not changed:
        changed=True;path.write_bytes(raw+b'\nchanged')
    return raw
capture.read_safe=mutate
try:read()
except ValueError as error:ok('mixed revision refused','CHANGED' in str(error))
else:raise AssertionError('mixed capture accepted')
capture.read_safe=native_read
(skills/'bmod-test/bmod.toml').write_text('[bmod]\ncode="test"\nversion="99"\n',encoding='utf-8')
try:read()
except ValueError as error:ok('unqualified G2 refused','G2_PROFILE_REFUSED' in str(error))
else:raise AssertionError('unknown profile accepted')
print(json.dumps({'platform':sys.platform,'checks':checks,'count':len(checks),'network':False,'provider':False}))
`
test('P1/P2/P3/P4/P6 closed Windows progress helper: exact bytes, limits, mutations and refusal',async()=>{const result=await runHelpSourcesCase(cases);assert.equal(result.value.platform,'win32');assert.ok(result.value.count>=18);assert.equal(result.execution.job_active_after_stop,0);assert.deepEqual(result.preflight,['sitecustomize','cache','parent-venv']);console.log(JSON.stringify(result.value))})
