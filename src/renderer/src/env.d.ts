import type {GraphBridge} from '../../contracts/bmad-graph.ts'
import type {ProjectFilesBridge} from '../../contracts/project-files.ts'
import type {BmadCatalogBridge} from '../../contracts/bmad-catalog.ts'
import type {BmadContextBridge} from '../../contracts/bmad-context.ts'
import type {BmadProgressBridge} from '../../contracts/bmad-progress.ts'
import type {HelpBridge} from '../../contracts/bmad-help.ts'
import type { MadnessBridge } from '../../contracts/index.ts'
import type { ConnectionBridge } from '../../contracts/connection.ts'
import type { DialogueBridge } from '../../contracts/dialogue.ts'
import type { AppearanceBridge } from '../../contracts/appearance.ts'
import type { LanguageBridge } from '../../contracts/language.ts'
declare global { interface Window {
    madnessLanguage: LanguageBridge;
    madnessUsMetrics:import('../../contracts/us-metrics.ts').UsMetricsBridge;
    madnessBmadInitialization:import('../../contracts/bmad-initialization.ts').InitializationBridge;
    madnessCatalogLaunch: import('../../contracts/bmad-catalog-launch.ts').CatalogLaunchBridge; madnessGraph:GraphBridge; projectFiles:ProjectFilesBridge; madnessBmadCatalog:BmadCatalogBridge; madnessBmadProgress:BmadProgressBridge;madnessBmadContext:BmadContextBridge;madnessHelp:HelpBridge; madness: MadnessBridge; madnessConnection: ConnectionBridge; madnessDialogue: DialogueBridge; madnessAppearance: AppearanceBridge } }
