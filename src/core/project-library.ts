import type {AppState,ProjectContext} from '../contracts/index.ts'
import type {BmadContextState} from '../contracts/bmad-context.ts'
import {selectionValidity} from '../contracts/bmad-context.ts'
import type {BmadProgressState,BmadProgressSnapshot} from '../contracts/bmad-progress.ts'
import type {HelpState,HelpRecord} from '../contracts/bmad-help.ts'
import {projectBmadProgress} from './bmad-progress.ts'
import {sameContext} from './work-overview.ts'
import type {WorkOverviewState} from './work-overview.ts'

const canonical=(path:string)=>path.replaceAll('\\','/').replace(/\/$/,'').toLowerCase()
export type LibraryEvidence={snapshot:BmadProgressSnapshot;current:boolean;reason:string;generation:number;projection:ReturnType<typeof projectBmadProgress>}
export type ProjectLibraryEntry={project:ProjectContext;initiative:string|null;initiativeName:string|null;selection:string;evidence:LibraryEvidence|null;limits:string[];conversations:WorkOverviewState['conversations'];proposals:{record:HelpRecord;limits:string[]}[]}
/** Local facts only. No date of activity is inferred from message order or project opening. */
export function projectLibrary(app:AppState,contexts:BmadContextState,progress:BmadProgressState,help:HelpState,overview:WorkOverviewState):ProjectLibraryEntry[]{
 return app.projects.map(project=>{
  const context=contexts.projects.find(p=>p.projectId===project.id),selection=context?.selection,observation=context?.observation,value=progress.projects.find(p=>p.projectId===project.id),snapshot=value?.snapshot
  const valid=!!context&&selectionValidity(context)==='valid'&&canonical(selection!.rootPath)===canonical(project.rootPath)
  const limits:string[]=[]
  if(!valid)limits.push('Sélection absente, disparue ou racine remplacée — contexte courant non établi.')
  if(context?.storage==='failed')limits.push('Choix conservé pour cette session — enregistrement échoué.')
  let evidence:LibraryEvidence|null=null
  if(snapshot&&snapshot.projectId===project.id&&canonical(snapshot.rootPath)===canonical(project.rootPath)){
   const matching=valid&&snapshot.rootIdentity===selection!.rootIdentity&&snapshot.initiativeId===selection!.initiativeId&&snapshot.contextRevision===observation!.revision
   const current=matching&&context?.freshness==='current'&&value?.status==='ready'&&value.freshness==='current'
   const reason=!matching?'Observation d’un autre contexte ou d’une ancienne racine — historique seulement.':!current?'Observation précédente — fraîcheur non garantie.':'Observation locale datée — aucune fraîcheur continue garantie.'
   evidence={snapshot:structuredClone(snapshot),current,reason,generation:value!.generation,projection:projectBmadProgress(structuredClone(snapshot))}
   if(snapshot.coverage==='partial')limits.push('Observation partielle : '+snapshot.problems.join(' · '))
  }else limits.push('Preuves du projet non lues ou indisponibles — état et travail restant non établis.')
  if(value?.error)limits.push(value.error)
  const conversations=overview.conversations.filter(c=>c.context.projectId===project.id).map(c=>structuredClone(c))
  const proposals=help.records.filter(r=>r.context.projectId===project.id&&canonical(r.bundle.rootPath)===canonical(project.rootPath)&&conversations.some(c=>sameContext(c.context,r.context))).map(record=>({record:structuredClone(record),limits:[
   'Proposition littérale au contexte capturé — ni prochaine action structurée ni acceptation humaine.',
   'Le bundle ne prouve ni l’identité physique de la racine ni la révision du contexte courant.',
   ...(record.outcome!=='received'||record.transmission!=='transmitted'?['Réponse partielle ou issue non confirmée.']:[]),
   ...(record.storage!=='stored'?['Conservation locale non confirmée.']:[])
  ]}))
  return {project:{...project},initiative:valid?selection!.initiativeId:null,initiativeName:valid?observation!.initiatives.find(i=>i.id===selection!.initiativeId)?.name??selection!.initiativeId:null,selection:valid?'Sélection Madness conservée':'Aucune sélection valide',evidence,limits,conversations,proposals}
 })
}
