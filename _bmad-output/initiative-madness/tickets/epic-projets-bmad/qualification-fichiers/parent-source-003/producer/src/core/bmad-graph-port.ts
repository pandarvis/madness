import type {GraphAnalysisEvent,GraphAnalysisRequest,GraphStopRequest} from '../contracts/bmad-graph.ts'

/**
 * Frontière de dépendance déclarative du cœur.
 * L'adaptateur futur décode/normalise et rapporte les observations corrélées.
 * Le coordinateur existant possède autorisation, garde globale, Job, drain et fermeture.
 * Une résolution de Promise ou un AbortSignal n'est pas une preuve d'arrêt.
 * L'observateur ne contourne jamais validateGraphAnalysisEvent/publishGraphEvent.
 * Aucun stockage ni abonné concret n'est créé par ce module.
 */
export interface GraphAnalysisPort {
 analyze(request:GraphAnalysisRequest,observe:(event:GraphAnalysisEvent)=>void,signal:AbortSignal):Promise<void>
 stop(request:GraphStopRequest):Promise<Extract<GraphAnalysisEvent,{type:'stopped'}>>
}

