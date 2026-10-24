import type { MadnessBridge } from '../../contracts/index.ts'
import type { ConnectionBridge } from '../../contracts/connection.ts'
import type { DialogueBridge } from '../../contracts/dialogue.ts'
import type { AppearanceBridge } from '../../contracts/appearance.ts'
declare global { interface Window { madness: MadnessBridge; madnessConnection: ConnectionBridge; madnessDialogue: DialogueBridge; madnessAppearance: AppearanceBridge } }
