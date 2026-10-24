import type { MadnessBridge } from '../../contracts/index.ts'
import type { ConnectionBridge } from '../../contracts/connection.ts'
declare global { interface Window { madness: MadnessBridge; madnessConnection: ConnectionBridge } }
