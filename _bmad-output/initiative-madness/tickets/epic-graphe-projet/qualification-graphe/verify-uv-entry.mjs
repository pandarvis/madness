// Narrow regression: every child launch inside qualify.mjs is intercepted.
// The witnesses contain no Python, packages or Graphify analysis.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const load=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const root=fs.mkdtempSync(path.join(os.tmpdir(),'mg41-uv-guard-'));
const manifest=load(path.join(here,'assembly-manifest.json'));
const before=path.join(here,'.uv-guard-before.mjs');
const preload=path.join(root,'intercept.mjs');
const rows=[];
fs.mkdirSync(path.join(root,'runtime'));fs.mkdirSync(path.join(root,'packages'));
fs.writeFileSync(preload,`
import fs from 'node:fs';
import cp from 'node:child_process';
import {syncBuiltinESMExports} from 'node:module';
const read=fs.readFileSync;
fs.readFileSync=function(p,...args){
 if(process.env.G41_MUTATE_UV==='1'&&String(p).toLowerCase()===process.env.G41_UV.toLowerCase())return Buffer.from('owned simulated changed UV bytes');
 return read.call(this,p,...args);
};
cp.spawnSync=function(exe,args){
 fs.appendFileSync(process.env.G41_TRACE,JSON.stringify({exe,args,intercepted:true})+'\\n');
 return {status:0,stdout:'intercepted: no process started',stderr:''};
};
syncBuiltinESMExports();
`);
function test(name,candidate,uv,{mutate=false,refused=false,error='UV_CHANGED'}={}){
 const file=path.join(root,name+'.json'),trace=path.join(root,name+'.trace');
 const output=path.join(root,name+'-output');
 fs.writeFileSync(file,JSON.stringify({owner:root,runtime:[],packages:[],uv}));
 const result=spawnSync(process.execPath,['--import',pathToFileURL(preload).href,candidate,'--mode=run','--assembly='+file,'--output='+output],{encoding:'utf8',windowsHide:true,env:{...process.env,G41_TRACE:trace,G41_UV:manifest.uv.path,G41_MUTATE_UV:mutate?'1':'0'},timeout:60000});
 const calls=fs.existsSync(trace)?fs.readFileSync(trace,'utf8').trim().split('\n').map(JSON.parse):[];
 assert.equal(result.error,undefined,name+': bounded Node completion');
 assert.equal(result.status,refused?1:0,name+': exit: '+result.stderr);
 assert.equal(calls.length,refused?0:1,name+': first run() entry');
 if(refused){assert.match(result.stderr,new RegExp(error),name+': refusal reason');assert.equal(fs.existsSync(output),false,name+': refusal precedes output mutation');}
 rows.push({case:name,exit:result.status,interceptedRunEntries:calls.length,error:refused?error:null,outputCreated:fs.existsSync(output)});
}
try{
 // Archived003 is the exact vulnerable implementation reviewed by the parent.
 // Same directory preserves its import.meta.url based project-root resolution.
 assert.equal(fs.existsSync(before),false,'temporary historical witness must be fresh');
 fs.copyFileSync(path.join(here,'source-versions/003/qualify.mjs'),before);
 test('red-historical-content-not-checked',before,manifest.uv,{mutate:true});
 fs.unlinkSync(before);
 const candidate=path.join(here,'qualify.mjs');
 test('green-content-change-refused',candidate,manifest.uv,{mutate:true,refused:true});
 test('green-manifest-pin-change-refused',candidate,{...manifest.uv,sha256:'0'.repeat(64)},{refused:true});
 const fake=path.join(root,'unqualified.exe');fs.writeFileSync(fake,'owned non-executable witness');
 test('green-unpinned-path-refused',candidate,{path:fake,sha256:manifest.uv.sha256},{refused:true});
 const alias=path.join(root,'hardlink.exe');fs.linkSync(fake,alias);
 test('green-chain-hardlink-refused',candidate,{path:alias,sha256:manifest.uv.sha256},{refused:true,error:'LINK:'});
 test('green-pinned-uv-reaches-intercept-only',candidate,manifest.uv);
 fs.writeFileSync(path.join(here,'uv-entry-guard-test.json'),JSON.stringify({passed:true,scope:'isolated main() UV admission; all child starts intercepted; no Graphify analysis',candidateSha256:sha(fs.readFileSync(candidate)),historicalSha256:sha(fs.readFileSync(path.join(here,'source-versions/003/qualify.mjs'))),cases:rows},null,2)+'\n');
 console.log(JSON.stringify({passed:true,cases:rows.length,realUvStarts:0,graphifyAnalyses:0,rows}));
}finally{
 if(fs.existsSync(before))fs.unlinkSync(before);
 const target=path.resolve(root),temp=path.resolve(os.tmpdir());
 assert.ok(target.startsWith(temp+path.sep)&&path.basename(target).startsWith('mg41-uv-guard-'),'owned cleanup boundary');
 fs.rmSync(target,{recursive:true});
}


