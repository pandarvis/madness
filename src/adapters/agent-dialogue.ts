import type { DialogueSession } from '../core/ports.ts'
import type { AgentRunner, AgentTurnResult } from '../core/autopilot.ts'
import { dialogueFailure } from '../contracts/dialogue.ts'

const names: Record<string, string> = { 'bmad-agent-analyst': 'Mary', 'bmad-agent-pm': 'John', 'bmad-agent-architect': 'Winston', 'bmad-agent-ux-designer': 'Sally', 'bmad-agent-po': 'Sofia', 'bmad-agent-dev': 'Amelia', 'bmad-party-mode': 'Table ronde' }

type Options = {
  run: AgentRunner
  root: string
  projectId: string
  skill: string
  initiativeId: string | null
  signal: AbortSignal
  /** Starts the turn inside the dialogue's own submit step, so state and native work stay in step. */
  submit: (start: () => void) => Promise<void>
}

/** A conversation with any BMad agent through Codex: the same native runs as the autopilot, resumed turn after turn. */
export function openAgentDialogue(options: Options): DialogueSession {
  const local = new AbortController(), stopLocal = (): void => local.abort()
  options.signal.addEventListener('abort', stopLocal, { once: true })
  let sessionRef: string | null = null, running: Promise<AgentTurnResult> | null = null
  return {
    context: { providerId: 'codex', connectionId: 'codex-agent-' + crypto.randomUUID(), initiativeId: options.initiativeId },
    async turn(text, accepted, observe) {
      if (text === null) throw dialogueFailure('UNSUPPORTED_INTERACTION')
      local.signal.throwIfAborted()
      await options.submit(() => { running = options.run({ root: options.root, skill: options.skill, text, sessionRef, signal: local.signal, projectId: options.projectId }) })
      if (!running) throw dialogueFailure('PROVIDER_FAILED')
      await accepted()
      const result: AgentTurnResult = await (running as Promise<AgentTurnResult>).catch(() => { throw dialogueFailure('PROVIDER_FAILED') })
      running = null
      sessionRef = result.sessionRef
      observe?.({ id: 'codex-agent-result-' + crypto.randomUUID(), order: 1, text: result.text, completed: !result.incomplete, identity: { kind: 'attested', name: names[options.skill] ?? 'Codex', source: 'codex' } })
      return result.text
    },
    async stop() {
      local.abort()
      options.signal.removeEventListener('abort', stopLocal)
      await (running as Promise<AgentTurnResult> | null)?.catch(() => undefined)
      return 'stopped'
    },
  }
}
