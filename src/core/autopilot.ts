import { decisionPrompt, parseDecision, actionLabel, changesCode } from './orchestrator.ts'
import type { Decision } from './orchestrator.ts'
import { splitAcross } from './usage.ts'
import type { UsageEntry } from './usage.ts'
import { initialAutopilotState, isAutopilotCommand } from '../contracts/autopilot.ts'
import type { AutopilotCommand, AutopilotProvider, AutopilotRun, AutopilotState, AutopilotStep } from '../contracts/autopilot.ts'

export type AgentTurnInput = { root: string; skill: string; text: string; sessionRef: string | null; signal: AbortSignal; projectId: string }
export type AgentTurnResult = { text: string; sessionRef: string; tokens: number; incomplete?: boolean }
export type AgentRunner = (input: AgentTurnInput) => Promise<AgentTurnResult>
export type PlannedStory = { epic: string; epicTitle: string; storyId: number; title: string; built: boolean }
export type ProjectPlan = { requirements: boolean; architecture: boolean; epics: boolean; stories: PlannedStory[]; initiative: string | null }
export type TestResult = { ok: boolean; output: string }

type Dependencies = {
  store: { read(): Promise<AutopilotRun[]>; write(runs: AutopilotRun[]): Promise<void> }
  project(projectId: string): Promise<{ name: string; rootPath: string }>
  runner(provider: AutopilotProvider): AgentRunner
  ensureInitiative(root: string, projectName: string): Promise<void>
  plan(root: string): Promise<ProjectPlan>
  tests(root: string, signal: AbortSignal): Promise<TestResult | null>
  now(): Date
  canRun?(projectId: string): boolean
  commit?(root: string, message: string): Promise<void>
  notify?(title: string, body: string): void
  /** Installed BMad skills, for the conductor's choices. */
  skills?(root: string): Promise<string[]>
  /** Every turn's cost, kept per initiative even after the run is cleared. */
  usage?(entries: UsageEntry[]): void
}

const MAX_TEST_ATTEMPTS = 3
const QUOTA_RETRY_MS = 30 * 60 * 1000
// A conductor that keeps choosing without finishing is stuck: hand the project back.
const MAX_DECISIONS = 24
const AUTONOMY = 'Travaille en autonomie : personne ne peut te répondre. Ne pose aucune question, tranche toi-même et valide les étapes humaines à la place de l’utilisateur. Note chaque décision importante prise à sa place dans le fichier decisions-autopilote.md du dossier de l’initiative active. Commite ton travail. Termine par un résumé de trois lignes maximum.'
const PHASES: readonly { id: 'requirements' | 'ux' | 'architecture' | 'epics'; title: string; skill: string; text: string }[] = [
  { id: 'requirements', title: 'Exigences', skill: 'bmad-agent-po', text: 'Rédige les exigences de l’initiative active à partir du brief et de l’idéation déjà présents dans le projet.' },
  { id: 'ux', title: 'Expérience utilisateur', skill: 'bmad-agent-ux-designer', text: 'Définis l’expérience utilisateur à partir des exigences. Si le projet n’a pas d’interface, ne produis rien et dis-le en une phrase.' },
  { id: 'architecture', title: 'Architecture', skill: 'bmad-agent-architect', text: 'Conçois l’architecture à partir des exigences.' },
  { id: 'epics', title: 'Epics et stories', skill: 'bmad-agent-po', text: 'Découpe les exigences en epics et en stories prêtes à construire, avec leurs fichiers tickets.toml.' },
]
const storyPrompt = (step: AutopilotStep): string => 'Implémente la story ' + step.storyId + ' « ' + step.title + ' » de l’epic ' + step.epic + ' (dossier tickets de l’initiative active). Utilise la compétence bmad-build en suivant son déroulé complet, y compris la revue indépendante par sous-agents et la correction de ses constats.'
export const isQuotaFailure = (message: string): boolean => /hit your .*limit|usage limit|rate.?limit|quota|limit reached|too many requests|\b429\b/i.test(message)

const emptyStep = (partial: Pick<AutopilotStep, 'id' | 'kind' | 'title' | 'skill'> & Partial<AutopilotStep>): AutopilotStep => ({ epic: null, epicTitle: null, storyId: null, status: 'pending', startedAt: null, durationMs: 0, tokens: 0, attempts: 0, summary: null, ...partial })
const storyStep = (story: PlannedStory): AutopilotStep => emptyStep({ id: story.epic + '#' + story.storyId, kind: 'story', title: story.title, skill: 'bmad-agent-dev', epic: story.epic, epicTitle: story.epicTitle, storyId: story.storyId, status: story.built ? 'skipped' : 'pending' })

/** One engine per project: runs never share a session, so several projects build at the same time. */
export class AutopilotCoordinator {
  private state: AutopilotState = initialAutopilotState()
  private listeners = new Set<(state: AutopilotState) => void>()
  private controllers = new Map<string, AbortController>()
  private timers = new Map<string, ReturnType<typeof setTimeout>>()
  private work = new Map<string, Promise<void>>()
  private roots = new Map<string, string>()
  private authRetries = new Set<string>()
  private writes: Promise<unknown> = Promise.resolve()
  private closing = false
  private deps: Dependencies
  constructor(deps: Dependencies) { this.deps = deps }

  async restore(): Promise<void> {
    const runs = await this.deps.store.read()
    this.state = { ...this.state, runs: runs.map(run => ['running', 'preparing'].includes(run.status) ? { ...run, status: run.recap || run.status === 'running' ? 'paused' as const : 'stopped' as const, pauseReason: 'interrupted' as const, steps: run.steps.map(step => step.status === 'running' ? { ...step, status: 'pending' as const } : step) } : run) }
    this.emit()
    for (const run of this.state.runs) if (run.pauseReason === 'quota' && run.resumeAt) this.scheduleResume(run.projectId, run.resumeAt)
  }
  read(): AutopilotState { return structuredClone(this.state) }
  subscribe(listener: (state: AutopilotState) => void): () => void { this.listeners.add(listener); return () => this.listeners.delete(listener) }
  isBusy(projectId: string): boolean { return this.work.has(projectId) || this.run(projectId)?.status === 'running' || this.run(projectId)?.status === 'preparing' }
  isBusyAt(rootPath: string): boolean { return [...this.roots].some(([id, root]) => root === rootPath && this.isBusy(id)) }

  async execute(input: unknown): Promise<AutopilotState> {
    if (!isAutopilotCommand(input) || this.closing) return this.read()
    if (input.type !== 'read' && input.type !== 'open') this.dispatch(input)
    return this.read()
  }
  private dispatch(input: Exclude<AutopilotCommand, { type: 'read' | 'open' }>): void {
    const id = input.projectId, run = this.run(id)
    if (input.type === 'stop') { this.stop(id); return }
    if (input.type === 'dismiss') { if (!this.isBusy(id)) { this.state = { ...this.state, runs: this.state.runs.filter(item => item.projectId !== id) }; this.emit() } return }
    if (this.isBusy(id)) return
    if (input.type === 'prepare') { this.spawn(id, () => this.prepare(id, input.provider)); return }
    if (input.type === 'start' && run?.status === 'ready' || input.type === 'resume' && run && ['paused', 'stopped'].includes(run.status)) {
      // Two agents in one repository would overwrite each other: an open conversation on this project has priority.
      if (this.deps.canRun && !this.deps.canRun(id)) { this.update(id, { detail: 'Une conversation avec un agent est ouverte sur ce projet : arrête-la d’abord.' }); return }
      this.clearResume(id); this.update(id, { status: 'running', pauseReason: null, detail: null, resumeAt: null, startedAt: run.startedAt ?? this.stamp(), steps: run.steps.map(step => step.status === 'failed' ? { ...step, status: 'pending' } : step) }); this.spawn(id, () => this.loop(id))
    }
  }
  private spawn(id: string, job: (signal: AbortSignal) => Promise<void>): void {
    const controller = new AbortController(); this.controllers.set(id, controller)
    const task: Promise<void> = job(controller.signal).catch(error => {
      if (controller.signal.aborted) return
      const message = error instanceof Error ? error.message.slice(0, 500) : 'Erreur inconnue'
      // Without a plan there is nothing to resume: back to the launch button, with the reason.
      if (this.run(id)?.status === 'preparing') this.update(id, { status: 'stopped', pauseReason: null, detail: message })
      else this.update(id, { status: 'paused', pauseReason: 'failure', detail: message })
    }).finally(() => { if (this.controllers.get(id) === controller) this.controllers.delete(id); if (this.work.get(id) === task) this.work.delete(id); this.emit() })
    this.work.set(id, task)
  }
  private stop(id: string): void {
    this.clearResume(id); this.controllers.get(id)?.abort()
    const run = this.run(id); if (run && ['running', 'preparing', 'paused'].includes(run.status)) this.update(id, { status: 'stopped', pauseReason: null, resumeAt: null, steps: run.steps.map(step => step.status === 'running' ? { ...step, status: 'pending' } : step) })
  }

  private async prepare(id: string, provider: AutopilotProvider): Promise<void> {
    // Registered first so that a failure below is visible on the project instead of being lost.
    this.replace({ schemaVersion: 1, projectId: id, provider, status: 'preparing', pauseReason: null, detail: null, recap: null, steps: [], startedAt: null, updatedAt: this.stamp(), resumeAt: null })
    const signal = this.controllers.get(id)!.signal, project = await this.deps.project(id)
    this.roots.set(id, project.rootPath)
    await this.deps.ensureInitiative(project.rootPath, project.name)
    const turn = await this.deps.runner(provider)({ root: project.rootPath, projectId: id, skill: 'bmad-agent-analyst', sessionRef: null, signal, text: 'Sans rien modifier, résume ce projet en cinq lignes à partir du brief, de la spec et des documents existants, puis indique la prochaine étape du plan automatique. Ne pose aucune question.' })
    const plan = await this.deps.plan(project.rootPath)
    if (signal.aborted) return
    // No fixed pipeline: stories already planned build first, then Madness asks BMad what comes next.
    this.update(id, { status: 'ready', recap: turn.text, recommendation: null, initiative: plan.initiative, steps: plan.stories.map(storyStep) })
    this.record(id, { kind: 'decision', tokens: turn.tokens, ms: 0, title: 'Récapitulatif' })
  }

  private async loop(id: string): Promise<void> {
    const signal = this.controllers.get(id)!.signal
    const project = await this.deps.project(id)
    this.roots.set(id, project.rootPath)
    for (;;) {
      if (signal.aborted || this.closing) return
      const run = this.run(id)!, step = run.steps.find(item => item.status === 'pending')
      if (step) { if (!await this.perform(id, step.id, project.rootPath, signal)) return; continue }
      if (run.steps.filter(item => item.kind === 'decision').length >= MAX_DECISIONS) { this.update(id, { status: 'paused', pauseReason: 'failure', detail: 'Madness a enchaîné ' + MAX_DECISIONS + ' décisions sans terminer : le chantier a besoin d’un regard humain.' }); return }
      const decision = await this.decide(id, project.rootPath, signal)
      if (!decision) return
      if (decision.done) { this.finish(id, project.name, decision); return }
      if (!decision.autonomous) {
        this.update(id, { status: 'paused', pauseReason: 'guidance', detail: decision.question, recommendation: { skill: decision.skill, agent: decision.agent, why: decision.why, question: decision.question } })
        this.deps.notify?.('Madness', project.name + ' : ' + (decision.agent ?? 'un agent') + ' a besoin de toi.')
        return
      }
      // The same choice three times in a row without the project moving: stop instead of looping.
      const actions = run.steps.filter(item => item.kind === 'action').slice(-2)
      if (actions.length === 2 && actions.every(item => item.skill === decision.skill)) { this.update(id, { status: 'paused', pauseReason: 'failure', detail: 'BMad recommande encore « ' + actionLabel(decision.skill) + ' » sans que le projet avance.' }); return }
      const current = this.run(id)!, number = current.steps.filter(item => item.kind === 'action').length + 1
      this.update(id, { recommendation: null, steps: [...current.steps, emptyStep({ id: 'action-' + number, kind: 'action', title: actionLabel(decision.skill), skill: decision.skill, summary: decision.why, instruction: 'Applique la compétence ' + decision.skill + ' pour ceci : ' + decision.why })] })
    }
  }
  private finish(id: string, name: string, decision?: Decision): void {
    this.update(id, { status: 'done', detail: null, recommendation: decision && (decision.question || decision.skill) ? { skill: decision.skill, agent: decision.agent, why: decision.why, question: decision.question } : null })
    this.deps.notify?.('Madness', name + ' est prêt à essayer.')
  }
  private async perform(id: string, stepId: string, root: string, signal: AbortSignal): Promise<boolean> {
    const run = this.run(id)!, runner = this.deps.runner(run.provider), started = Date.now()
    const phase = PHASES.find(item => item.id === stepId), first = this.step(id, stepId)
    this.patchStep(id, stepId, { status: 'running', startedAt: first.startedAt ?? this.stamp(), attempts: 0 })
    let spent = 0
    const builtBefore = first.kind === 'action' ? new Set((await this.deps.plan(root)).stories.filter(story => story.built).map(story => story.epic + '#' + story.storyId)) : null
    let sessionRef: string | null = null, prompt = (phase ? phase.text : first.kind === 'action' ? first.instruction ?? first.summary ?? '' : storyPrompt(first)) + ' ' + AUTONOMY
    try {
      for (let attempt = 1; ; attempt++) {
        const turn = await runner({ root, projectId: id, skill: first.skill, text: prompt, sessionRef, signal }); sessionRef = turn.sessionRef; spent += turn.tokens
        const current = this.step(id, stepId)
        this.patchStep(id, stepId, { attempts: attempt, tokens: current.tokens + turn.tokens, durationMs: first.durationMs + Date.now() - started, summary: turn.text.slice(0, 2000) })
        if (signal.aborted) { this.patchStep(id, stepId, { status: 'pending' }); return false }
        if (turn.incomplete) {
          if (attempt >= MAX_TEST_ATTEMPTS) { this.patchStep(id, stepId, { status: 'failed' }); this.update(id, { status: 'paused', pauseReason: 'failure', detail: 'L’agent a atteint sa limite d’actions sur « ' + first.title + ' ».' }); return false }
          prompt = 'Continue exactement là où tu t’es arrêté. ' + AUTONOMY; continue
        }
        if (first.kind === 'phase' || first.kind === 'action' && !changesCode(first.skill)) break
        const tests = await this.deps.tests(root, signal)
        if (signal.aborted) { this.patchStep(id, stepId, { status: 'pending' }); return false }
        if (!tests || tests.ok) {
          if (first.kind === 'action') break
          const planned = (await this.deps.plan(root)).stories.find(story => story.epic === first.epic && story.storyId === first.storyId)
          if (!planned || planned.built) break
          if (attempt >= MAX_TEST_ATTEMPTS) { this.patchStep(id, stepId, { status: 'failed' }); this.update(id, { status: 'paused', pauseReason: 'failure', detail: 'La story « ' + first.title + ' » n’est pas marquée construite dans son plan.' }); return false }
          prompt = 'La story n’est pas marquée construite dans son plan BMad. Termine son déroulé jusqu’au statut built, puis commite. ' + AUTONOMY; continue
        }
        if (attempt >= MAX_TEST_ATTEMPTS) { this.patchStep(id, stepId, { status: 'failed' }); this.update(id, { status: 'paused', pauseReason: 'tests', detail: 'Les tests restent en échec après ' + MAX_TEST_ATTEMPTS + ' tentatives sur « ' + first.title + ' ».' }); return false }
        prompt = 'Les tests du projet échouent. Corrige sans changer leur intention, puis commite. Sortie : ' + tests.output.slice(-6000) + ' ' + AUTONOMY
      }
      if (phase) await this.assertPhaseProduced(phase.id, root, first.title)
      if (stepId === 'epics') await this.addStories(id, root)
      // A slicing or planning action may have written new tickets: their stories build before the next decision.
      if (first.kind === 'action') await this.addStories(id, root, false)
      // Codex's sandbox keeps .git read-only: Madness records each finished step itself.
      await this.deps.commit?.(root, first.title + ' (pilote Madness)')
      this.patchStep(id, stepId, { status: 'done', durationMs: first.durationMs + Date.now() - started })
      return true
    } catch (error) {
      this.patchStep(id, stepId, { status: signal.aborted ? 'pending' : 'failed', durationMs: first.durationMs + Date.now() - started })
      if (signal.aborted) return false
      const message = error instanceof Error ? error.message : 'Erreur inconnue'
      // An access token that expired during a long run: the next attempt starts with a fresh one.
      if (/401|token is expired/i.test(message) && !this.authRetries.has(id + stepId)) { this.authRetries.add(id + stepId); this.patchStep(id, stepId, { status: 'pending' }); return true }
      if (isQuotaFailure(message)) {
        const resumeAt = new Date(this.deps.now().getTime() + QUOTA_RETRY_MS).toISOString()
        this.patchStep(id, stepId, { status: 'pending' }); this.update(id, { status: 'paused', pauseReason: 'quota', detail: 'Limite de l’abonnement atteinte.', resumeAt }); this.scheduleResume(id, resumeAt)
      } else this.update(id, { status: 'paused', pauseReason: 'failure', detail: message.slice(0, 500) })
      return false
    } finally {
      const ms = Date.now() - started
      if (spent || ms > 1000) {
        if (first.kind === 'story') this.record(id, { kind: 'story', tokens: spent, ms, title: first.title, epic: first.epic, epicTitle: first.epicTitle, storyId: first.storyId })
        else if (first.kind === 'action' && builtBefore) {
          // A build chosen by BMad outside the tickets loop: its cost goes to the stories it actually built.
          const built = (await this.deps.plan(root).catch(() => ({ stories: [] as PlannedStory[] }))).stories.filter(story => story.built && !builtBefore.has(story.epic + '#' + story.storyId))
          this.recordAll(id, splitAcross({ projectId: id, initiative: this.run(id)?.initiative ?? null, kind: 'action', at: this.stamp(), tokens: spent, ms, title: first.title }, built))
        } else this.record(id, { kind: 'action', tokens: spent, ms, title: first.title })
      }
    }
  }
  private record(id: string, entry: Omit<UsageEntry, 'projectId' | 'initiative' | 'at'>): void {
    this.recordAll(id, [{ ...entry, projectId: id, initiative: this.run(id)?.initiative ?? null, at: this.stamp() }])
  }
  private recordAll(id: string, entries: UsageEntry[]): void { try { this.deps.usage?.(entries) } catch { /* Counting never stops a build. */ } }
  /** An agent saying it is done proves nothing: the document has to exist. */
  private async assertPhaseProduced(phase: typeof PHASES[number]['id'], root: string, title: string): Promise<void> {
    if (phase === 'ux') return
    const plan = await this.deps.plan(root)
    if (!plan[phase]) throw Error('La phase « ' + title + ' » n’a produit aucun document.')
  }
  private async addStories(id: string, root: string, required = true): Promise<void> {
    const plan = await this.deps.plan(root), run = this.run(id)!, known = new Set(run.steps.map(step => step.id))
    this.update(id, { steps: [...run.steps, ...plan.stories.map(storyStep).filter(step => !known.has(step.id) && step.status === 'pending')] })
    if (required && !plan.stories.length) throw Error('La phase de découpage n’a produit aucune story.')
  }
  /** Madness asks BMad's own help skill what the project needs next. Counted like any step: it costs time and tokens. */
  private async decide(id: string, root: string, signal: AbortSignal): Promise<Decision | null> {
    const run = this.run(id)!, runner = this.deps.runner(run.provider), started = Date.now(), stepId = 'decision-' + (run.steps.filter(step => step.kind === 'decision').length + 1)
    const skills = await this.deps.skills?.(root) ?? []
    const history = run.steps.filter(step => step.status === 'done' && step.kind !== 'decision').map(step => step.title + (step.summary ? ' : ' + step.summary.replace(/\s+/g, ' ').slice(0, 200) : ''))
    this.update(id, { steps: [...run.steps, emptyStep({ id: stepId, kind: 'decision', title: 'Madness choisit la suite', skill: 'bmad', status: 'running', startedAt: this.stamp() })] })
    let tokens = 0, sessionRef: string | null = null
    try {
      for (let attempt = 1; attempt <= 2; attempt++) {
        const turn = await runner({ root, projectId: id, skill: 'bmad', text: attempt === 1 ? decisionPrompt(skills, history) : 'Ta réponse ne contenait pas de décision lisible. Réponds uniquement par le bloc json demandé, avec une compétence de la liste.', sessionRef, signal })
        sessionRef = turn.sessionRef; tokens += turn.tokens
        if (signal.aborted) { this.dropStep(id, stepId); return null }
        const decision = parseDecision(turn.text, skills)
        if (decision) {
          this.patchStep(id, stepId, { status: 'done', title: decision.done ? 'Madness : chantier terminé' : 'Madness choisit : ' + actionLabel(decision.skill), summary: decision.why, tokens, attempts: attempt, durationMs: Date.now() - started })
          this.record(id, { kind: 'decision', tokens, ms: Date.now() - started, title: 'Décision' })
          return decision
        }
      }
      this.patchStep(id, stepId, { status: 'failed', tokens, durationMs: Date.now() - started })
      this.update(id, { status: 'paused', pauseReason: 'failure', detail: 'BMad n’a pas donné de prochaine action exploitable.' })
      return null
    } catch (error) {
      if (signal.aborted) { this.dropStep(id, stepId); return null }
      this.patchStep(id, stepId, { status: 'failed', tokens, durationMs: Date.now() - started })
      const message = error instanceof Error ? error.message : 'Erreur inconnue'
      if (isQuotaFailure(message)) {
        const resumeAt = new Date(this.deps.now().getTime() + QUOTA_RETRY_MS).toISOString()
        this.dropStep(id, stepId); this.update(id, { status: 'paused', pauseReason: 'quota', detail: 'Limite de l’abonnement atteinte.', resumeAt }); this.scheduleResume(id, resumeAt)
      } else this.update(id, { status: 'paused', pauseReason: 'failure', detail: message.slice(0, 500) })
      return null
    }
  }
  private dropStep(id: string, stepId: string): void { const run = this.run(id); if (run) this.update(id, { steps: run.steps.filter(step => step.id !== stepId) }) }
  private scheduleResume(id: string, at: string): void {
    this.clearResume(id)
    this.timers.set(id, setTimeout(() => { const run = this.run(id); if (run?.status !== 'paused' || run.pauseReason !== 'quota') return; if (this.deps.canRun && !this.deps.canRun(id)) { this.scheduleResume(id, new Date(this.deps.now().getTime() + 300000).toISOString()); return } this.dispatch({ contractVersion: 1, correlationId: 'autopilot-quota-resume', type: 'resume', projectId: id }) }, Math.max(1000, Date.parse(at) - this.deps.now().getTime())))
  }
  private clearResume(id: string): void { const timer = this.timers.get(id); if (timer) clearTimeout(timer); this.timers.delete(id) }
  async shutdown(): Promise<void> {
    this.closing = true
    for (const timer of this.timers.values()) clearTimeout(timer)
    for (const controller of this.controllers.values()) controller.abort()
    await Promise.allSettled(this.work.values())
    this.state = { ...this.state, runs: this.state.runs.map(run => run.status === 'running' ? { ...run, status: 'paused', pauseReason: 'interrupted', steps: run.steps.map(step => step.status === 'running' ? { ...step, status: 'pending' } : step) } : run) }
    await this.persist()
  }

  private run(id: string): AutopilotRun | undefined { return this.state.runs.find(run => run.projectId === id) }
  private step(id: string, stepId: string): AutopilotStep { return this.run(id)!.steps.find(step => step.id === stepId)! }
  private stamp(): string { return this.deps.now().toISOString() }
  private replace(run: AutopilotRun): void { this.state = { ...this.state, runs: [...this.state.runs.filter(item => item.projectId !== run.projectId), run] }; this.emit() }
  private update(id: string, change: Partial<AutopilotRun>): void { const run = this.run(id); if (run) this.replace({ ...run, ...change, updatedAt: this.stamp() }) }
  private patchStep(id: string, stepId: string, change: Partial<AutopilotStep>): void { const run = this.run(id); if (run) this.update(id, { steps: run.steps.map(step => step.id === stepId ? { ...step, ...change } : step) }) }
  private emit(): void { this.state = { ...this.state, sequence: this.state.sequence + 1 }; void this.persist(); for (const listener of this.listeners) try { listener(this.read()) } catch { /* A failing listener must not stop the engine. */ } }
  private persist(): Promise<unknown> { const runs = structuredClone(this.state.runs); this.writes = this.writes.then(() => this.deps.store.write(runs)).catch(() => undefined); return this.writes }
}
