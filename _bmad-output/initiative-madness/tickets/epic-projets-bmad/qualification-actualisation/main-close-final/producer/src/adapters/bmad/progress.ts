import type {BmadHelpAdapter} from './help.ts'
import type {BmadSelection,BmadContextObservation} from '../../contracts/bmad-context.ts'
import type {BmadProgressSnapshot} from '../../contracts/bmad-progress.ts'
import {isBmadProgressSnapshot} from '../../contracts/bmad-progress.ts'
import {dialogueFailure} from '../../contracts/dialogue.ts'
export class BmadProgressAdapter{
 private helper:BmadHelpAdapter
 constructor(helper:BmadHelpAdapter){this.helper=helper}
 async collect(id:string,root:string,selection:BmadSelection,observation:BmadContextObservation,signal:AbortSignal):Promise<BmadProgressSnapshot>{const result=await this.helper.observeProgress(id,root,selection,observation,signal);if(!isBmadProgressSnapshot(result))throw dialogueFailure('PROFILE_UNRECOGNIZED');return result}
}
