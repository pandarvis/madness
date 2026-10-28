// Reproduction synthétique de la course A1, entièrement en mémoire.
// Exécuter avec Node depuis le dépôt ; aucun profil, modèle ni fichier n'est modifié.
import {createRequire,syncBuiltinESMExports} from 'node:module'
import {resolve,join} from 'node:path'
import {ForgeHost} from '../../../../../src/adapters/bmad/forge.ts'

const fs=createRequire(import.meta.url)('node:fs/promises')
const original={lstat:fs.lstat,realpath:fs.realpath,readdir:fs.readdir}
const root=resolve('C:/audit-memory'),base=join(root,'output','initiative-test')
let swapped=false,checksAfterSwap=0
fs.lstat=async path=>{if(swapped&&path===base)checksAfterSwap++;return {isSymbolicLink:()=>swapped&&path===base}}
fs.realpath=async path=>swapped&&path===base?resolve('C:/outside-audit'):path
fs.readdir=async path=>{if(path===base)swapped=true;return []}
syncBuiltinESMExports()
try{
  const host=new ForgeHost({rootPath:root,forge:{outputBase:base,initiativeId:'initiative-test',contextDigest:''}},new AbortController().signal)
  // Les gardes de manifeste et de résolution ne sont pas le sujet de ce test unitaire.
  host.assert=async()=>{}
  host.resolved.add('workflow');host.resolved.add('config')
  const receipts=[];host.bind(async receipt=>receipts.push(receipt))
  let result=null,errorCode=null
  try{result=JSON.parse(await host.execute({kind:'check-sessions'},'race-call','race-turn'))}
  catch(error){errorCode=error.code??error.name}
  console.log(JSON.stringify({scenario:'initiative changes to an external junction during readdir',result,errorCode,checksAfterSwap,receipts},null,2))
}finally{Object.assign(fs,original);syncBuiltinESMExports()}
