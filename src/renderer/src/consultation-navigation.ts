import type {ContextRef} from '../../contracts/index.ts'
export type WorkTab='parcours'|'conversation'|'catalogue'|'graphe'
export type ConsultationPosition={projectId:string;rootPath:string;rootIdentity:string|null;tab:WorkTab;conversationId:string|null;conversationContext:ContextRef|null;inputId:string|null;start:number|null;end:number|null;top:number;focus:HTMLElement|null}
export const consultationKey=(id:string,path:string,identity:string|null):string=>JSON.stringify([id,path.replaceAll('\\','/').replace(/\/$/,'').toLowerCase(),identity])
/** A completion may publish global data but may navigate/focus only for the live intent. */
export function navigationCurrent(captured:{token:number;projectId:string},token:number,projectId:string|undefined):boolean{return captured.token===token&&captured.projectId===projectId}
