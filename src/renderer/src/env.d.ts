import type { MadnessBridge } from '../../contracts/index.ts'
import type { ConnectionBridge } from '../../contracts/connection.ts'
import type { DialogueBridge } from '../../contracts/dialogue.ts'
declare global { interface Window { madness: MadnessBridge; madnessConnection: ConnectionBridge; madnessDialogue: DialogueBridge } }
