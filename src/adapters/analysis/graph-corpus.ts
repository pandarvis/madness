import type {GraphSource} from '../../contracts/bmad-graph.ts'
/** Host-only original. Private native receipt + WeakMap carry physical authority; this DTO does not. */
export type OriginalGraphCapture={projectId:string;rootPath:string;rootIdentity:string;revision:string;observedAt:string;sources:{id:string;path:string;sha256:string;bytes:number}[];corpus:GraphSource[];excluded:string[]}
