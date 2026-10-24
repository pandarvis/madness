import type { ContextRef } from '../contracts/index.ts'
export type ManagedOperation = { id: string; context: ContextRef; stop(): Promise<'stopped' | 'unknown'> }
type StopResult = { id: string; context: ContextRef; outcome: 'stopped' | 'unknown' }
/** Ne crée aucun travail : les connecteurs futurs enregistreront leurs opérations possédées. */
export class LifecycleCoordinator {
  private operations = new Map<string, ManagedOperation>()
  private closing = false
  private shutdownResult: Promise<StopResult[]> | null = null
  get state(): 'idle' | 'closing' { return this.closing ? 'closing' : 'idle' }
  register(operation: ManagedOperation): void {
    if (this.closing || this.operations.has(operation.id)) throw new Error('OPERATION_UNAVAILABLE')
    this.operations.set(operation.id, operation)
  }
  complete(id: string): void { this.operations.delete(id) }
  shutdown(): Promise<StopResult[]> {
    if (this.shutdownResult) return this.shutdownResult
    this.closing = true
    const operations = [...this.operations.values()]
    this.operations.clear()
    this.shutdownResult = Promise.all(operations.map(async (operation) => {
      try { return { id: operation.id, context: operation.context, outcome: await operation.stop() } }
      catch { return { id: operation.id, context: operation.context, outcome: 'unknown' as const } }
    }))
    return this.shutdownResult
  }
}
