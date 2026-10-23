import { contextBridge, ipcRenderer } from 'electron'
import { COMMAND_CHANNEL, EVENT_CHANNEL, isDomainEvent, isReply } from '../contracts/index.ts'
import type { Command, MadnessBridge, Reply } from '../contracts/index.ts'
const request = async (payload: Omit<Command, 'contractVersion' | 'correlationId'> | Record<string, unknown>): Promise<Reply> => {
  const correlationId = crypto.randomUUID()
  const reply: unknown = await ipcRenderer.invoke(COMMAND_CHANNEL, { ...payload, contractVersion: 1, correlationId })
  if (!isReply(reply)) throw new Error('INVALID_BRIDGE_REPLY')
  // Un refus de payload/appelant a une corrélation fixe car l'entrée n'est pas fiable.
  if (reply.correlationId !== correlationId && (reply.ok || !['INVALID_COMMAND', 'UNTRUSTED_CALLER'].includes(reply.error.code))) throw new Error('UNRELATED_BRIDGE_REPLY')
  return reply
}
const bridge: MadnessBridge = {
  readState: () => request({ type: 'read-state' }),
  chooseDirectory: () => request({ type: 'choose-directory' }),
  selectProject: (projectId) => request({ type: 'select-project', projectId }),
  saveDraft: (projectId, text) => request({ type: 'save-draft', projectId, text }),
  setNavigation: (collapsed) => request({ type: 'set-navigation', collapsed }),
  onStateChanged: (listener) => {
    const receive = (_event: Electron.IpcRendererEvent, value: unknown): void => { if (isDomainEvent(value)) listener(value) }
    ipcRenderer.on(EVENT_CHANNEL, receive)
    return () => ipcRenderer.removeListener(EVENT_CHANNEL, receive)
  }
}
contextBridge.exposeInMainWorld('madness', Object.freeze(bridge))
