import test from 'node:test'
import assert from 'node:assert/strict'
import {runHelpSourcesCase} from './helpers/help-native.mjs'
const source=String.raw`import json,sys
from pathlib import Path
import worker,capture,progress
root=capture.long_path(sys.argv[1]);project=root/'project';project.mkdir();skills=project/'.agents/skills';(skills/'bmod-test').mkdir(parents=True);(project/'_bmad').mkdir()
(skills/'bmod-test/bmod.toml').write_text('[bmod]\ncode="test"\nversion="6.13.0-next"\n',encoding='utf-8')
(project/'_bmad/config.toml').write_text('[core]\nactive_initiative="beta"\n',encoding='utf-8')
beta=project/'_bmad-output/beta';beta.mkdir(parents=True);(beta/'beta.md').write_text('# beta\n',encoding='utf-8');leaves=beta/'tickets';leaves.mkdir()
serial=0;checks={}
def read():
    global serial
    serial+=1;folder=root/('snapshot-'+str(serial));folder.mkdir();req={'project':str(project),'roots':[str(skills)],'folder':str(folder)};context=worker.context_observation(req);req.update(initiativeId='beta',rootIdentity=context['rootIdentity'],contextRevision=context['revision']);return progress.collect(req,context)
def check(name,value):checks[name]=bool(value)
(leaves/'tickets.toml').write_text('[[entry]]\nid=2\ntype="story"\ntitle="foo"\n',encoding='utf-8')
(leaves/'foo.md').write_text('---\ntype: story\nid: 2\nstatus: in-progress\n---\n',encoding='utf-8')
(leaves/'plan.md').write_text('---\nticket: foo\nstatus: built\n---\n',encoding='utf-8')
value=read();check('H2-alphanumeric-stem-joins-unmatched-id',any(d['ticketId']=='2' and d['value']=='built' for d in value['declarations']))
check('H2-conflicting-leaf-and-plan-keep-same-identity',sorted(d['value'] for d in value['declarations'] if d['ticketId']=='2' and d['field']=='status')==['built','in-progress'])
(leaves/'plan.md').unlink();(leaves/'foo.md').unlink()
for label,text in [('multiline-basic','[[entry]]\nid=2\ntype="story"\ntitle="foo"\ndescription="""\nstatus = "done"\n[[entry]]\n"""\nstatus = "in-progress"\n'),('multiline-literal',"[[entry]]\nid=2\ntype='story'\ndescription='''\nstatus = 'done'\n[[entry]]\n'''\nstatus = 'in-progress'\n"),('quoted-keys','[["entry"]]\n"id"=2\n"type"="story"\n"status"="in-progress"\n')]:
    (leaves/'tickets.toml').write_text(text,encoding='utf-8');value=read();actual=next((d for d in value['declarations'] if d['ticketId']=='2' and d['field']=='status'),None)
    expected=next(n for n,line in enumerate(text.splitlines(),1) if 'in-progress' in line)
    check('H3-'+label+'-actual-status-line',actual is not None and actual['value']=='in-progress' and actual['line']==expected)
    check('H3-'+label+'-valid-toml-not-refused',not any('TOML invalide' in p or 'ENTRY_LOCATIONS' in p for p in value['problems']))
(leaves/'tickets.toml').write_text('[[entry]]\nid=2\ntype="story"\n',encoding='utf-8')
for name in ('brief-demo','prd-demo','architecture-demo','research-demo','ux-demo','prfaq-demo','brainstorm-demo','forge-demo'):
    folder=beta/name;folder.mkdir();(folder/(name+'.md')).write_text('# '+name+'\n\n## Decisions\nLiteral decision '+name+'\n',encoding='utf-8')
    if name=='ux-demo':
        for spine in ('DESIGN.md','EXPERIENCE.md'):(folder/spine).write_text('# Spine\n\n## Decisions\nLiteral '+spine+'\n',encoding='utf-8')
    (folder/'qualification-heavy').mkdir();(folder/'qualification-heavy/never-read.md').write_bytes(b'X'*2097152)
    (folder/'imports').mkdir();(folder/'imports/never-read.md').write_bytes(b'X'*2097152)
value=read()
for name in ('brief-demo','prd-demo','architecture-demo','research-demo','ux-demo','prfaq-demo','brainstorm-demo','forge-demo'):
    check('F4-canonical-'+name,any(s['relativePath']==name+'/'+name+'.md' for s in value['sources']))
for spine in ('DESIGN.md','EXPERIENCE.md'):check('F4-ux-'+spine,any(s['relativePath']=='ux-demo/'+spine for s in value['sources']))
check('F4-no-heavy-evidence-or-import-recursion',not any('never-read' in s['path'] for s in value['sources']))
check('F4-literal-canonical-decisions',len([e for e in value['excerpts'] if e['category']=='decisions'])==10)
epic=leaves/'epic-a';epic.mkdir();(epic/'epic-a.md').write_text('---\ntype: epic\nstatus: in-progress\n---\n',encoding='utf-8')
for name in ('prd-demo','architecture-demo','ux-demo'):
    folder=epic/name;folder.mkdir();(folder/(name+'.md')).write_text('# '+name+'\n\n## Decisions\nLiteral epic '+name+'\n',encoding='utf-8')
    if name=='ux-demo':
        for spine in ('DESIGN.md','EXPERIENCE.md'):(folder/spine).write_text('# Spine\n\n## Decisions\nLiteral epic '+spine+'\n',encoding='utf-8')
    (folder/'qualification-heavy').mkdir();(folder/'qualification-heavy/never-read.md').write_bytes(b'X'*2097152)
value=read()
for name in ('prd-demo','architecture-demo','ux-demo'):check('F4-epic-canonical-'+name,any(s['relativePath']=='tickets/epic-a/'+name+'/'+name+'.md' for s in value['sources']))
for spine in ('DESIGN.md','EXPERIENCE.md'):check('F4-epic-ux-'+spine,any(s['relativePath']=='tickets/epic-a/ux-demo/'+spine for s in value['sources']))
before=value['revision'];changed=epic/'prd-demo/prd-demo.md';changed.write_text('# PRD\n\n## Decisions\nChanged epic decision.\n',encoding='utf-8');after=read()
check('F4-epic-document-mutation-changes-revision',after['revision']!=before)
check('F4-epic-document-hash-from-actual-bytes',any(s['relativePath']=='tickets/epic-a/prd-demo/prd-demo.md' and s['sha256']==capture.sha(changed.read_bytes()) for s in after['sources']))
check('F4-epic-heavy-proof-excluded',not any('never-read' in s['path'] for s in after['sources']))
print(json.dumps({'platform':sys.platform,'checks':checks,'count':len(checks),'network':False,'provider':False}))
assert all(checks.values()),json.dumps(checks)
`
test('review H2/H3/F4: real Windows source joins, TOML lexical provenance and conventional v7 documents',async()=>{const result=await runHelpSourcesCase(source);assert.equal(result.value.platform,'win32');assert.equal(result.execution.job_active_after_stop,0);assert.ok(result.value.count>=16);assert.equal(Object.values(result.value.checks).every(Boolean),true);console.log(JSON.stringify(result.value))})

test('Q2 filename joins retain recognized leaves without inventing native ids',async()=>{
 const result=await runHelpSourcesCase(String.raw`import json,sys
import worker,capture,progress
root=capture.long_path(sys.argv[1]);project=root/'project';project.mkdir();skills=project/'.agents/skills';(skills/'bmod-test').mkdir(parents=True);(project/'_bmad').mkdir()
(skills/'bmod-test/bmod.toml').write_text('[bmod]\ncode="test"\nversion="6.13.0-next"\n',encoding='utf-8')
(project/'_bmad/config.toml').write_text('[core]\nactive_initiative="beta"\n',encoding='utf-8')
beta=project/'_bmad-output/beta';beta.mkdir(parents=True);(beta/'beta.md').write_text('# beta\n',encoding='utf-8');leaves=beta/'tickets';leaves.mkdir()
(leaves/'tickets.toml').write_text('[[entry]]\nid="foo"\ntype="story"\n',encoding='utf-8')
leaf=leaves/'story-demo.md';leaf.write_text('---\ntype: story\nstatus: in-progress\n---\n',encoding='utf-8')
(leaves/'demo-plan.md').write_text('---\nticket: story-demo\nstatus: blocked\n---\n',encoding='utf-8')
(leaves/'foo.md').write_text('---\ntype: story\nstatus: draft\n---\n',encoding='utf-8')
(leaves/'foo-plan.md').write_text('---\nticket: foo\nstatus: ready-for-dev\n---\n',encoding='utf-8')
(leaves/'orphan-plan.md').write_text('---\nticket: nowhere\nstatus: built\n---\n',encoding='utf-8')
def read(n):
 folder=root/('snapshot-'+str(n));folder.mkdir();req={'project':str(project),'roots':[str(skills)],'folder':str(folder)};context=worker.context_observation(req);req.update(initiativeId='beta',rootIdentity=context['rootIdentity'],contextRevision=context['revision']);return progress.collect(req,context)
value=read(1);checks={}
def declaration(snapshot,path):
 source=next(s for s in snapshot['sources'] if s['relativePath']==path);return next(d for d in snapshot['declarations'] if d['sourceId']==source['id'] and d['field']=='status')
leaf_decl=declaration(value,'tickets/story-demo.md');plan=declaration(value,'tickets/demo-plan.md')
checks['filename-join-no-native-id']=leaf_decl['ticketId'] is not None and leaf_decl['ticketId']==plan['ticketId']
checks['explicit-file-identity-bounded']=isinstance(leaf_decl['ticketId'],str) and leaf_decl['ticketId'].startswith('@file:') and len(leaf_decl['ticketId'])<=255
checks['raw-statuses-retained']=leaf_decl['value']=='in-progress' and plan['value']=='blocked'
checks['native-id-unknown-explicit']=any('native inconnue' in p and 'story-demo.md' in p for p in value['problems'])
checks['joined-plan-not-orphan']=not any('orphelin' in p.lower() and 'demo-plan.md' in p for p in value['problems'])
checks['id-first-before-filename']=declaration(value,'tickets/foo-plan.md')['ticketId']=='foo' and declaration(value,'tickets/foo.md')['ticketId']!='foo'
checks['genuine-orphan-preserved']=any('Plan orphelin conserve' in p and 'orphan-plan.md' in p for p in value['problems'])
leaf.write_text('---\ntype: story\nstatus: draft\n---\n',encoding='utf-8');after=read(2)
checks['file-identity-stable-across-content-revision']=declaration(after,'tickets/story-demo.md')['ticketId']==leaf_decl['ticketId'] and value['revision']!=after['revision']
print(json.dumps({'platform':sys.platform,'checks':checks,'count':len(checks),'network':False,'provider':False}));assert all(checks.values()),json.dumps(checks)
`)
 assert.equal(result.value.platform,'win32');assert.equal(result.execution.job_active_after_stop,0);assert.equal(Object.values(result.value.checks).every(Boolean),true);console.log(JSON.stringify(result.value))
})
