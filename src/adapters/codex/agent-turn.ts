import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import type { AgentTurnInput, AgentTurnResult } from '../../core/autopilot.ts'
import { buildAgenticPrompt } from '../claude/dialogue.ts'
import { findNativeExecutable, probeEnvironment } from './probe.ts'

type Options = { appData: string; root: string; realHome: string; environment: NodeJS.ProcessEnv; accessToken(signal: AbortSignal): Promise<string>; timeoutMs?: number }

function settings(realHome: string): string[] {
  return ['cli_auth_credentials_store="file"', 'model_provider="openai_chatgpt_plan"', 'model_providers.openai_chatgpt_plan.name="ChatGPT plan"', 'model_providers.openai_chatgpt_plan.base_url="https://api.openai.com/v1"', 'model_providers.openai_chatgpt_plan.env_key="ACCESS_TOKEN"', 'model_providers.openai_chatgpt_plan.wire_api="responses"', 'model_providers.openai_chatgpt_plan.requires_openai_auth=false', 'model_providers.openai_chatgpt_plan.supports_websockets=false',
    'approval_policy="never"', 'sandbox_mode="workspace-write"', 'sandbox_workspace_write.network_access=true', 'web_search="disabled"', 'features.apps=false', 'features.plugins=false', 'mcp_servers={}',
    // The isolated home hides the user's git identity; the access token stays out of every tool's environment.
    'shell_environment_policy.inherit="core"', 'shell_environment_policy.set.GIT_CONFIG_GLOBAL=' + JSON.stringify(join(realHome, '.gitconfig'))]
}
export type CodexEvent = { type?: string; thread_id?: string; item?: { type?: string; text?: string }; usage?: { input_tokens?: number; output_tokens?: number; cached_input_tokens?: number }; error?: { message?: string }; message?: string }
/** `codex exec --json` writes one event per line; the last agent message is the reply. */
export function readCodexEvents(stdout: string): { text: string; threadId: string | null; tokens: number; failure: string | null } {
  let text = '', threadId: string | null = null, tokens = 0, failure: string | null = null
  for (const line of stdout.split('\n')) {
    if (!line.trim().startsWith('{')) continue
    let event: CodexEvent; try { event = JSON.parse(line) as CodexEvent } catch { continue }
    if (event.type === 'thread.started' && event.thread_id) threadId = event.thread_id
    if (event.type === 'item.completed' && event.item?.type === 'agent_message' && event.item.text) text = event.item.text
    if (event.type === 'turn.completed') tokens += Math.max(0, (event.usage?.input_tokens ?? 0) - (event.usage?.cached_input_tokens ?? 0)) + (event.usage?.output_tokens ?? 0)
    if (event.type === 'turn.failed') failure = event.error?.message ?? 'Codex a échoué.'
    if (event.type === 'error') failure = event.message ?? failure
  }
  return { text, threadId, tokens, failure }
}
export async function codexAgentTurn(options: Options, input: AgentTurnInput): Promise<AgentTurnResult> {
  const executable = await findNativeExecutable(options.appData), home = join(options.root, input.projectId)
  await mkdir(join(home, 'codex-home'), { recursive: true })
  const token = await options.accessToken(input.signal), resume = input.sessionRef !== null
  const args = ['exec', ...(resume ? ['resume'] : []), '--json', '--skip-git-repo-check', ...settings(options.realHome).flatMap(value => ['-c', value]), ...(resume ? [input.sessionRef!] : []), '-']
  const prompt = resume ? input.text : buildAgenticPrompt(input.skill, input.text, [])
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, { cwd: input.root, env: probeEnvironment(options.environment, home, token), shell: false, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] })
    let stdout = '', stderr = ''; child.stdout.on('data', chunk => { stdout += chunk }); child.stderr.on('data', chunk => { stderr = (stderr + chunk).slice(-4000) })
    const kill = (): void => { if (child.pid) spawn('taskkill', ['/T', '/F', '/PID', String(child.pid)], { windowsHide: true, stdio: 'ignore' }) }
    const timer = setTimeout(kill, options.timeoutMs ?? 45 * 60 * 1000); input.signal.addEventListener('abort', kill, { once: true })
    child.once('error', reject)
    child.once('close', code => {
      clearTimeout(timer); input.signal.removeEventListener('abort', kill)
      const result = readCodexEvents(stdout)
      if (result.failure) return reject(Error(result.failure))
      if (code !== 0 || !result.text) return reject(Error(stderr.trim().slice(-500) || 'Codex s’est arrêté sans réponse.'))
      resolve({ text: result.text, sessionRef: result.threadId ?? input.sessionRef ?? '', tokens: result.tokens })
    })
    child.stdin.end(prompt)
  })
}
