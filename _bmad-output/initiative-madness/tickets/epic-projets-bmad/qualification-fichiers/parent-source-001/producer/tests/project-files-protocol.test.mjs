import test from 'node:test'
import assert from 'node:assert/strict'
import {isProjectFilesCommand,isProjectFilesState,initialProjectFilesState} from '../src/contracts/project-files.ts'
test('F1/F5 renderer cannot supply paths, URIs, command lines or registrations',()=>{const v={contractVersion:1,correlationId:'files-test-001',type:'preview',referenceId:'ref-test'};assert.equal(isProjectFilesCommand(v),true);for(const extra of [{path:'C:/outside'},{uri:'vscode://file/C:/x'},{command:'calc'},{line:42}])assert.equal(isProjectFilesCommand({...v,...extra}),false);assert.equal(isProjectFilesCommand({...v,type:'register'}),false);assert.equal(isProjectFilesCommand({...v,referenceId:'../outside'}),false);assert.equal(isProjectFilesState(initialProjectFilesState()),true)})

import {runHelpSourcesCase} from './helpers/help-native.mjs'
const native=String.raw`import json,os,sys
from pathlib import Path
import capture,files,catalog,worker,progress
root=capture.long_path(sys.argv[1]);project=root/'code-only';project.mkdir();data=root/'receipt';data.mkdir();checks=[]
def ok(name,value):
    assert value,name;checks.append(name)
def refused(fn,name):
    try:fn()
    except (ValueError,OSError):checks.append(name);return
    raise AssertionError(name)
path=project/'a #.ts';raw=b'<script>hostile()</script>\n';path.write_bytes(raw)
# No BMad configuration or discovery is needed by the common native producer port.
grant=files.publish(data,project,'corpus','a'*64,[files.record(path,'code-source',raw)])
req={'prepared':str(data),'receiptSha':capture.sha((data/'files.json').read_bytes()),'producer':'corpus','revision':'a'*64,'sourceId':'code-source','op':'files-read'}
a=files.operate(req);ok('F1 code without BMad and exact inert hostile text',a['text'].encode()==raw and not (project/'_bmad').exists())
req['sourceId']='../outside';refused(lambda:files.operate(req),'F1 source id cannot be a path');req['sourceId']='code-source'
req['receiptSha']='f'*64;refused(lambda:files.operate(req),'F3 private receipt hash required');req['receiptSha']=capture.sha((data/'files.json').read_bytes())
path.write_bytes(b'changed');refused(lambda:files.operate(req),'F4 in-place edit refused')
path.unlink();path.write_bytes(raw);refused(lambda:files.operate(req),'F3 same-content replacement refused')
# Every native operation rechecks lexical ancestors, the final handle and identities.
entry=files.record(path,'code-source',raw);files.publish(data,project,'corpus','a'*64,[entry]);req['receiptSha']=capture.sha((data/'files.json').read_bytes())
outside=root/'outside.ts';outside.write_bytes(b'OUTSIDE SENTINEL');path.unlink();os.link(outside,path);before=len(capture.EVENTS)
refused(lambda:files.operate(req),'F3 hardlink refused');ok('F3 outside bytes never read',not any(e['path']==str(outside) for e in capture.EVENTS[before:]));path.unlink()
path.write_bytes(raw);files.publish(data,project,'corpus','a'*64,[files.record(path,'code-source',raw)]);req['receiptSha']=capture.sha((data/'files.json').read_bytes())
renamed=root/'old-root';project.rename(renamed);project.mkdir();(project/path.name).write_bytes(raw);refused(lambda:files.operate(req),'F3 replaced project root refused')
# Refuse formats distinctly; HTML and SVG stay literal UTF8 without link activation.
for suffix,body,admitted in [('.html',b'<a href="https://evil">link</a>',True),('.svg',b'<svg onload="evil()"/>',True),('.bin',b'text',False),('.txt',b'bad\xff',False),('.md',b'nul\x00body',False)]:
    p=project/('format'+suffix);p.write_bytes(body)
    files.publish(data,project,'corpus','a'*64,[files.record(p,'format',body)]);r={**req,'receiptSha':capture.sha((data/'files.json').read_bytes()),'sourceId':'format'}
    if admitted:ok('F2 inert '+suffix,files.operate(r)['text'].encode()==body)
    else:refused(lambda:files.operate(r),'F2 explicit format refusal '+suffix)
large=project/'large.md';large.write_bytes(b'x'*1048577);refused(lambda:files.publish(data,project,'corpus','a'*64,[files.record(large,'large',large.read_bytes())]),'F2 no silently truncated large file')
# Catalogue grants only actual project originals; external module documentation keeps its existing sheet.
skills=project/'skills';user=root/'external-skills';skills.mkdir();user.mkdir()
def put(p,text):
    p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text,encoding='utf-8')
put(skills/'module/bmod.toml','[bmod]\ncode="method"\nversion="6.13.0-next"\nskills=["alpha","beta"]\n')
for base,name in [(skills,'alpha'),(user,'beta')]:
    put(base/name/'bmod.toml','[skill]\nbmod="module"\n');put(base/name/'SKILL.md','---\nname: '+name+'\ndescription: literal\n---\n')
folder=root/'catalog';folder.mkdir();value=catalog.collect({'project':str(project),'roots':[str(skills),str(user)],'folder':str(folder)})
ok('F1 catalogue publishes only project originals',value['_fileGrant']['sources'] and all(capture.long_path(s['path']).is_relative_to(project) for s in value['_fileGrant']['sources']) and any(not capture.long_path(s['path']).is_relative_to(project) for s in value['sources']))
native_publish=files.publish
def bounded(*args,**kwargs):raise capture.Refusal('FILES_BOUND')
files.publish=bounded
folder=root/'catalog-bounded';folder.mkdir();limited=catalog.collect({'project':str(project),'roots':[str(skills),str(user)],'folder':str(folder)})
ok('F1 file receipt bound preserves independent catalogue with explicit refusal',bool(limited['items']) and not limited['_fileGrant']['sources'] and 'Limite' in limited['_fileGrant']['refusal'])
files.publish=native_publish
print(json.dumps({'platform':sys.platform,'checks':checks,'count':len(checks),'network':False,'provider':False}))
`
test('F1/F2/F3/F4 native physical grants with code-only capture and exact closed runtime',async()=>{const r=await runHelpSourcesCase(native);assert.equal(r.value.platform,'win32');assert.equal(r.execution.job_active_after_stop,0);assert.ok(r.value.count>=15);console.log(JSON.stringify(r.value))})
