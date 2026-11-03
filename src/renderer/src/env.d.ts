import type {BmadContextBridge} from '../../contracts/bmad-context.ts'
import type {HelpBridge} from '../../contracts/bmad-help.ts'
import type { MadnessBridge } from '../../contracts/index.ts'
import type { ConnectionBridge } from '../../contracts/connection.ts'
import type { DialogueBridge } from '../../contracts/dialogue.ts'
import type { AppearanceBridge } from '../../contracts/appearance.ts'
declare global { interface Window { madnessBmadContext:BmadContextBridge;madnessHelp:HelpBridge; madness: MadnessBridge; madnessConnection: ConnectionBridge; madnessDialogue: DialogueBridge; madnessAppearance: AppearanceBridge } }
