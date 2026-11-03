import type {BmadContextObservation,BmadConfigurationObservation} from '../../contracts/bmad-context.ts'
import {isBmadContextObservation,isBmadConfigurationObservation} from '../../contracts/bmad-context.ts'
import {dialogueFailure} from '../../contracts/dialogue.ts'
import type {BmadHelpAdapter} from './help.ts'
/** Opération locale fermée du runtime G2 possédé ; aucune aide ni code du projet. */
export class BmadContextAdapter{
 private helper:BmadHelpAdapter
 private reads:Promise<unknown>=Promise.resolve()
 constructor(helper:BmadHelpAdapter){this.helper=helper}
 observeConfiguration(projectId:string,rootPath:string,signal:AbortSignal):Promise<BmadConfigurationObservation>{
  const read=this.reads.then(async()=>{signal.throwIfAborted();const result=await this.helper.observeConfiguration(projectId,rootPath,signal);if(!isBmadConfigurationObservation(result))throw dialogueFailure('PROFILE_UNRECOGNIZED');return result})
  this.reads=read.catch(()=>{});return read
 }
 observe(projectId:string,rootPath:string,signal:AbortSignal):Promise<BmadContextObservation>{
  const read=this.reads.then(async()=>{signal.throwIfAborted();const result=await this.helper.observeContext(projectId,rootPath,signal);if(!isBmadContextObservation(result))throw dialogueFailure('PROFILE_UNRECOGNIZED');return result})
  this.reads=read.catch(()=>{});return read
 }
}
