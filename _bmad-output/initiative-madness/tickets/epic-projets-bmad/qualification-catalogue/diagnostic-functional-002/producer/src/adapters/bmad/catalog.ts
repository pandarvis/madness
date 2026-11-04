import type {BmadHelpAdapter} from './help.ts'
import {isBmadCatalogSnapshot} from '../../contracts/bmad-catalog.ts'
import type {BmadCatalogSnapshot} from '../../contracts/bmad-catalog.ts'
import {dialogueFailure} from '../../contracts/dialogue.ts'
export class BmadCatalogAdapter{private helper:BmadHelpAdapter;constructor(helper:BmadHelpAdapter){this.helper=helper}async collect(id:string,root:string,signal:AbortSignal):Promise<BmadCatalogSnapshot>{const value=await this.helper.observeCatalog(id,root,signal);if(!isBmadCatalogSnapshot(value))throw dialogueFailure('PROFILE_UNRECOGNIZED');return value}}
