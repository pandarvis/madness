/** Empreintes seulement, aucun contenu ou coffre copié. Exécuter avant toute réouverture. */
import {readFile,writeFile,readdir,lstat} from 'node:fs/promises'
import {join} from 'node:path'
import {createHash} from 'node:crypto'
import {isDeepStrictEqual} from 'node:util'
const profile=join(process.env.APPDATA,'Madness'),sha=b=>createHash('sha256').update(b).digest('hex'),files={}
const working='_bmad-output/initiative-madness/.working/',proof='_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-approvals/'
async function tree(path){let names;try{names=await readdir(join(profile,path))}catch(e){if(e.code==='ENOENT'){files[path+'/']='<absent>';return}throw e}for(const name of names.sort()){const file=join(path,name),info=await lstat(join(profile,file));if(info.isSymbolicLink())throw Error('PRESERVATION_LINK_REFUSED');if(info.isDirectory())await tree(file);else if(info.isFile()){if(Object.keys(files).length>=2000||info.size>8*1024*1024)throw Error('PRESERVATION_LIMIT');files[file.replaceAll('\\','/')]=sha(await readFile(join(profile,file)))}else throw Error('PRESERVATION_ENTRY_REFUSED')}}
for(const file of ['madness-state-v1.json','appearance-v1.json','Local State'])files[file]=sha(await readFile(join(profile,file)))
for(const directory of ['codex-connection-v1','questions-v1','workflows-v1','approvals-v1'])await tree(directory)
const mode=process.argv[2],digest=sha(JSON.stringify(files)),beforePath=working+'story16-preservation-before-install.json'
if(mode==='before'){await writeFile(beforePath,JSON.stringify({schemaVersion:1,observedAt:new Date().toISOString(),files,digest},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({mode,files:Object.keys(files).length,digest}))}
else if(mode==='after'){
 const before=JSON.parse(await readFile(beforePath)),live=JSON.parse(await readFile(proof+'live-completed-profile.json'));if(live.status!=='real-approvals-personal-qualified'||!live.cleanup.closed)throw Error('REAL_PROOF_REQUIRED')
 const expected=live.artifact.asarSha256,installed=sha(await readFile(join(process.env.LOCALAPPDATA,'Programs/Madness/resources/app.asar')))
 if(!isDeepStrictEqual(files,before.files))throw Error('DATA_PRESERVATION_MISMATCH');if(installed!==expected)throw Error('INSTALLED_ASAR_MISMATCH')
 const report={schemaVersion:1,observedAt:new Date().toISOString(),status:'replacement-data-preserved-before-reopen',installerExitCode:0,installedAsarSha256:installed,preservation:{files:Object.keys(files).length,beforeDigest:before.digest,afterDigest:digest,identical:true,includes:['snapshot','appearance','Local State','encrypted-vault','registration','questions','workflows','approvals']},limits:['Empreintes contrôlées avant toute réouverture ; restauration installée vérifiée séparément.','Ce remplacement personnel ne clôt pas les qualifications1.1/1.2/1.9 ni la distribution.']}
 await writeFile(proof+'installation.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({mode,files:Object.keys(files).length,identical:true,installed}))
}else throw Error('DIGEST_MODE_REQUIRED')
