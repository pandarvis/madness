export type MonitoringHealth='unarmed'|'watching'|'unavailable'
export type ObservationLease={health:MonitoringHealth;close():void;reconcile():Promise<boolean>}
/** Internal only. Values must originate in the pinned native capture. */
export interface ObservationPort{attach(value:object,changed:(health:MonitoringHealth)=>void):Promise<ObservationLease>}
