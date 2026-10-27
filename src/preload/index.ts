import { contextBridge, ipcRenderer } from 'electron'
import { COMMAND_CHANNEL, EVENT_CHANNEL, isDomainEvent, isReply } from '../contracts/index.ts'
import type { Command, MadnessBridge, Reply } from '../contracts/index.ts'
import { CONNECTION_COMMAND_CHANNEL, CONNECTION_EVENT_CHANNEL, isConnectionReply, isConnectionState } from '../contracts/connection.ts'
import type { ConnectionAction, ConnectionBridge, ConnectionReply } from '../contracts/connection.ts'
import { DIALOGUE_COMMAND_CHANNEL, DIALOGUE_EVENT_CHANNEL, isDialogueReply, isDialogueState } from '../contracts/dialogue.ts'
import type { DialogueBridge, DialogueCommand, DialogueState } from '../contracts/dialogue.ts'
import { APPEARANCE_CHANNEL, appearanceFromArguments, isAppearanceReply } from '../contracts/appearance.ts'
import type { AppearanceBridge, AppearanceState, Theme } from '../contracts/appearance.ts'
const appearanceRequest = async (action: { theme: Theme } | { type: 'read' }): Promise<AppearanceState> => {
  const correlationId = crypto.randomUUID()
  const reply: unknown = await ipcRenderer.invoke(APPEARANCE_CHANNEL, { contractVersion: 1, correlationId, ...action })
  if (!isAppearanceReply(reply)) throw new Error('INVALID_APPEARANCE_REPLY')
  if (reply.correlationId !== correlationId && (reply.ok || reply.correlationId !== 'rejected-request')) throw new Error('UNRELATED_APPEARANCE_REPLY')
  if (!reply.ok) throw new Error(reply.error)
  return reply.state
}
const appearanceBridge: AppearanceBridge = {
  initial: Object.freeze(appearanceFromArguments(process.argv)),
  read: () => appearanceRequest({ type: 'read' }),
  setTheme: (theme) => appearanceRequest({ theme })
}
contextBridge.exposeInMainWorld('madnessAppearance', Object.freeze(appearanceBridge))
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
const connectionRequest = async (action: ConnectionAction): Promise<ConnectionReply> => {
  const correlationId = crypto.randomUUID()
  const reply: unknown = await ipcRenderer.invoke(CONNECTION_COMMAND_CHANNEL, { contractVersion: 1, correlationId, action })
  if (!isConnectionReply(reply)) throw new Error('INVALID_CONNECTION_REPLY')
  if (reply.correlationId !== correlationId && (reply.correlationId !== 'rejected-request' || !['UNTRUSTED_CALLER', 'INVALID_COMMAND'].includes(reply.state.errorCode ?? ''))) throw new Error('UNRELATED_CONNECTION_REPLY')
  return reply
}
const connectionBridge: ConnectionBridge = {
  checkPublicKeys:()=>connectionRequest('check-public-keys'),cancelPublicKeys:()=>connectionRequest('cancel-public-keys'),
  read: () => connectionRequest('read'), connect: () => connectionRequest('connect'), verify: () => connectionRequest('verify'), cancel: () => connectionRequest('cancel'), disconnect: () => connectionRequest('disconnect'), acknowledgePlan: () => connectionRequest('acknowledge-plan'), manageUsage: () => connectionRequest('manage-usage'), openPublicKeys: () => connectionRequest('open-public-keys'), copyPublicKeys: () => connectionRequest('copy-public-keys'),
  onChanged: (listener) => {
    const receive = (_event: Electron.IpcRendererEvent, value: unknown): void => { if (isConnectionState(value)) listener(value) }
    ipcRenderer.on(CONNECTION_EVENT_CHANNEL, receive)
    return () => ipcRenderer.removeListener(CONNECTION_EVENT_CHANNEL, receive)
  }
}
contextBridge.exposeInMainWorld('madnessConnection', Object.freeze(connectionBridge))
const dialogueRequest = async (payload: Omit<DialogueCommand, 'contractVersion' | 'correlationId'> | Record<string, unknown>): Promise<DialogueState> => {
  const correlationId = crypto.randomUUID()
  const reply: unknown = await ipcRenderer.invoke(DIALOGUE_COMMAND_CHANNEL, { ...payload, contractVersion: 1, correlationId })
  if (!isDialogueReply(reply)) throw new Error('INVALID_DIALOGUE_REPLY')
  if (reply.correlationId !== correlationId && (reply.correlationId !== 'rejected-request' || !['INVALID_COMMAND', 'UNTRUSTED_CALLER'].includes(reply.state.errorCode ?? ''))) throw new Error('UNRELATED_DIALOGUE_REPLY')
  return reply.state
}
const dialogueBridge: DialogueBridge = {
  inspectApproval:approvalId=>dialogueRequest({type:'inspect-approval',approvalId}),observeStop:()=>dialogueRequest({type:'observe-stop'}),
  saveApproval:(approvalId,adjustment)=>dialogueRequest({type:'save-approval',approvalId,adjustment}),decideApproval:(approvalId,decision)=>dialogueRequest({type:'decide-approval',approvalId,decision}),sendAdjustment:approvalId=>dialogueRequest({type:'send-adjustment',approvalId}),
  saveQuestion:(questionId,values)=>dialogueRequest({type:'save-question',questionId,values}),answerQuestion:(questionId,values)=>dialogueRequest({type:'answer-question',questionId,values}),
  qualifyForge:projectId=>dialogueRequest({type:'qualify-forge',projectId}),launchForge:projectId=>dialogueRequest({type:'launch-forge',projectId}),copyWorkflow:(conversationId,target)=>dialogueRequest({type:'copy-workflow',conversationId,target}),
  read: () => dialogueRequest({ type: 'read' }), qualify: projectId => dialogueRequest({ type: 'qualify', projectId }), launch: (projectId,mode) => dialogueRequest({ type: 'launch', projectId,...(mode?{mode}:{}) }), send: (projectId, conversationId, text) => dialogueRequest({ type: 'send', projectId, conversationId, text }), stop: () => dialogueRequest({ type: 'stop' }),
  onChanged: listener => { const receive = (_event: Electron.IpcRendererEvent, value: unknown): void => { if (isDialogueState(value)) listener(value) }; ipcRenderer.on(DIALOGUE_EVENT_CHANNEL, receive); return () => ipcRenderer.removeListener(DIALOGUE_EVENT_CHANNEL, receive) }
}
contextBridge.exposeInMainWorld('madnessDialogue', Object.freeze(dialogueBridge))
