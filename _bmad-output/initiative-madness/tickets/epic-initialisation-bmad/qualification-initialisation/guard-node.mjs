/** Qualification-only preload: records executed imports and confines mutations; not an OS sandbox. */
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import {resolve, relative, isAbsolute, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {registerHooks, syncBuiltinESMExports} from 'node:module';
import {createHash} from 'node:crypto';
import net from 'node:net';
import tls from 'node:tls';
import http from 'node:http';
import https from 'node:https';
import cp from 'node:child_process';
const read = fs.readFileSync.bind(fs), rawWrite = fs.writeSync.bind(fs);
const config = JSON.parse(read(process.env.INIT31_GUARD, 'utf8'));
const within = (root, path) => {const r=relative(root, path);return !r || !isAbsolute(r)&&r!=='..'&&!r.startsWith('..\\')&&!r.startsWith('../');};
const events = config.events;
const descriptors=new Map([events,config.imports].map(path=>[path,fs.openSync(path,'a')]));
const append=(path,text)=>rawWrite(descriptors.get(path),text);
function checked(value, op) {
  const path=resolve(value instanceof URL?fileURLToPath(value):String(value));
  if(!config.writeRoots.some(root=>within(root,path)))throw Error(`MUTATION_OUTSIDE_PRIVATE_ROOT:${op}:${path}`);
  for(let parent=path;;parent=dirname(parent)){
    try {if(fs.lstatSync(parent).isSymbolicLink())throw Error(`LINK_REFUSED:${parent}`);}catch(e){if(e.code!=='ENOENT')throw e;}
    if(dirname(parent)===parent)break;
  }
  append(events,JSON.stringify({op,path})+'\n');return value;
}
const indexes={writeFile:[0],appendFile:[0],mkdir:[0],mkdtemp:[0],rm:[0],rmdir:[0],unlink:[0],rename:[0,1],copyFile:[1],cp:[1],chmod:[0],chown:[0],utimes:[0],symlink:[1],link:[1],truncate:[0]};
for(const [name,args] of Object.entries(indexes)){
  for(const [object,key] of [[fs,name],[fs,name+'Sync'],[fsp,name]])if(typeof object[key]==='function'){
    const original=object[key].bind(object);
    object[key]=function(...a){for(const i of args)checked(a[i],key);return original(...a);};
  }
}
for(const object of [fs,fsp])for(const name of ['open','openSync'])if(typeof object[name]==='function'){
  const original=object[name].bind(object);object[name]=function(path,flags,...rest){if(typeof flags==='number'?(flags&3)!==0:/[wa+]/.test(flags))checked(path,name);return original(path,flags,...rest);};
}
const originalStream=fs.createWriteStream.bind(fs);fs.createWriteStream=(path,options)=>{checked(path,'createWriteStream');return originalStream(path,options);};
const deny=(kind)=>()=>{append(events,JSON.stringify({refused:kind})+'\n');throw Error('QUALIFIER_DENIES_'+kind);};
globalThis.fetch=deny('network.fetch');
for(const [object,names] of [[net,['connect','createConnection']],[net.Socket.prototype,['connect']],[net.Server.prototype,['listen']],[tls,['connect']],[http,['get','request']],[https,['get','request']],[cp,['exec','execFile','spawn','fork','execSync','execFileSync','spawnSync']]])for(const name of names)object[name]=deny(name);
syncBuiltinESMExports();
registerHooks({load(url,context,next){
  if(url.startsWith('file:')){
    const path=fileURLToPath(url),expected=config.sealed[path.toLowerCase()];
    const content=read(path),sha256=createHash('sha256').update(content).digest('hex');
    if(expected!==sha256)throw Error('UNSEALED_EXECUTABLE:'+path);
    append(config.imports,JSON.stringify({path,sha256,bytes:content.length})+'\n');
  }
  return next(url,context);
}});

