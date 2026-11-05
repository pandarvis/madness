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
import { LANGUAGE_CHANNEL, languageFromArguments, isLanguageReply } from '../contracts/language.ts'
import type { LanguageBridge, LanguageState, Language } from '../contracts/language.ts'
const languageRequest = async (action: { language: Language } | { type: 'read' }): Promise<LanguageState> => {
  const correlationId = crypto.randomUUID()
  const reply: unknown = await ipcRenderer.invoke(LANGUAGE_CHANNEL, { contractVersion: 1, correlationId, ...action })
  if (!isLanguageReply(reply)) throw new Error('INVALID_LANGUAGE_REPLY')
  if (reply.correlationId !== correlationId && (reply.ok || reply.correlationId !== 'rejected-request')) throw new Error('UNRELATED_LANGUAGE_REPLY')
  if (!reply.ok) throw new Error(reply.error)
  return reply.state
}
const languageBridge: LanguageBridge = {
  initial: Object.freeze(languageFromArguments(process.argv)),
  read: () => languageRequest({ type: 'read' }),
  setLanguage: (language) => languageRequest({ language })
}
contextBridge.exposeInMainWorld('madnessLanguage', Object.freeze(languageBridge))
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
const dialogueRequest = async (payload: Omit<DialogueCommand, 'contractVersion' | 'correlationId'> | Record<string, unknown>,requestId?:string): Promise<DialogueState> => {
  const correlationId = requestId??crypto.randomUUID()
  const reply: unknown = await ipcRenderer.invoke(DIALOGUE_COMMAND_CHANNEL, { ...payload, contractVersion: 1, correlationId })
  if (!isDialogueReply(reply)) throw new Error('INVALID_DIALOGUE_REPLY')
  if (reply.correlationId !== correlationId && (reply.correlationId !== 'rejected-request' || !['INVALID_COMMAND', 'UNTRUSTED_CALLER'].includes(reply.state.errorCode ?? ''))) throw new Error('UNRELATED_DIALOGUE_REPLY')
  return reply.state
}
const dialogueBridge: DialogueBridge = {sendMeasured:(projectId,conversationId,text,requestId,choiceRef)=>dialogueRequest({type:'send',projectId,conversationId,text,metricsChoice:choiceRef},requestId),launchMeasured:(type,projectId,requestId,choiceRef,preparationId,mode)=>dialogueRequest({type,projectId,metricsChoice:choiceRef,...(type==='launch-catalog'?{preparationId}:type==='launch'&&mode?{mode}:{})},requestId),adjustMeasured:(approvalId,requestId,choiceRef)=>dialogueRequest({type:'send-adjustment',approvalId,metricsChoice:choiceRef},requestId),launchCatalog:(projectId,preparationId)=>dialogueRequest({type:'launch-catalog',projectId,preparationId},preparationId),launchHelp:projectId=>dialogueRequest({type:'launch-help',projectId}),
  inspectApproval:approvalId=>dialogueRequest({type:'inspect-approval',approvalId}),observeStop:()=>dialogueRequest({type:'observe-stop'}),
  saveApproval:(approvalId,adjustment)=>dialogueRequest({type:'save-approval',approvalId,adjustment}),decideApproval:(approvalId,decision)=>dialogueRequest({type:'decide-approval',approvalId,decision}),sendAdjustment:approvalId=>dialogueRequest({type:'send-adjustment',approvalId}),
  saveQuestion:(questionId,values)=>dialogueRequest({type:'save-question',questionId,values}),answerQuestion:(questionId,values)=>dialogueRequest({type:'answer-question',questionId,values}),
  qualifyForge:projectId=>dialogueRequest({type:'qualify-forge',projectId}),launchForge:projectId=>dialogueRequest({type:'launch-forge',projectId}),copyWorkflow:(conversationId,target)=>dialogueRequest({type:'copy-workflow',conversationId,target}),
  read: () => dialogueRequest({ type: 'read' }), qualify: projectId => dialogueRequest({ type: 'qualify', projectId }), launch: (projectId,mode) => dialogueRequest({ type: 'launch', projectId,...(mode?{mode}:{}) }), send: (projectId, conversationId, text) => dialogueRequest({ type: 'send', projectId, conversationId, text }), stop: () => dialogueRequest({ type: 'stop' }),
  onChanged: listener => { const receive = (_event: Electron.IpcRendererEvent, value: unknown): void => { if (isDialogueState(value)) listener(value) }; ipcRenderer.on(DIALOGUE_EVENT_CHANNEL, receive); return () => ipcRenderer.removeListener(DIALOGUE_EVENT_CHANNEL, receive) }
}
contextBridge.exposeInMainWorld('madnessDialogue', Object.freeze(dialogueBridge))
import {HELP_COMMAND_CHANNEL,HELP_EVENT_CHANNEL,isHelpState} from '../contracts/bmad-help.ts'
import type {HelpBridge,HelpState} from '../contracts/bmad-help.ts'
const helpRequest=async(payload:Record<string,unknown>):Promise<HelpState>=>{
 const correlationId=crypto.randomUUID()
 const reply:unknown=await ipcRenderer.invoke(HELP_COMMAND_CHANNEL,{...payload,contractVersion:1,correlationId})
 if(!reply||typeof reply!=='object'||!('state' in reply)||!('correlationId' in reply)||reply.correlationId!==correlationId||!isHelpState(reply.state))throw new Error('INVALID_HELP_REPLY')
 return reply.state
}
const helpBridge:HelpBridge={read:()=>helpRequest({type:'read'}),prepare:projectId=>helpRequest({type:'prepare',projectId}),copy:()=>helpRequest({type:'copy'}),retrySave:conversationId=>helpRequest({type:'retry-save',conversationId}),onChanged:listener=>{const receive=(_event:Electron.IpcRendererEvent,value:unknown):void=>{if(isHelpState(value))listener(value)};ipcRenderer.on(HELP_EVENT_CHANNEL,receive);return()=>ipcRenderer.removeListener(HELP_EVENT_CHANNEL,receive)}}
contextBridge.exposeInMainWorld('madnessHelp',Object.freeze(helpBridge))

import {BMAD_CONTEXT_COMMAND_CHANNEL,BMAD_CONTEXT_EVENT_CHANNEL,isBmadConfigurationObservation,isBmadContextState} from '../contracts/bmad-context.ts'
import type {BmadContextBridge,BmadContextState} from '../contracts/bmad-context.ts'
const contextRequest=async(payload:Record<string,unknown>):Promise<BmadContextState>=>{
 const correlationId=crypto.randomUUID(),reply:unknown=await ipcRenderer.invoke(BMAD_CONTEXT_COMMAND_CHANNEL,{...payload,contractVersion:1,correlationId})
 if(!reply||typeof reply!=='object'||!('state' in reply)||!('correlationId' in reply)||reply.correlationId!==correlationId||!isBmadContextState(reply.state))throw Error('INVALID_CONTEXT_REPLY')
 return reply.state
}
const bmadContextBridge:BmadContextBridge={observeInitialization:async projectId=>{
 const correlationId=crypto.randomUUID()
 const reply:unknown=await ipcRenderer.invoke(BMAD_CONTEXT_COMMAND_CHANNEL,{contractVersion:1,correlationId,projectId,type:'observe-initialization'})
 if(!reply||typeof reply!=='object'||Object.keys(reply).length!==3||!('contractVersion' in reply)||reply.contractVersion!==1||
    !('correlationId' in reply)||reply.correlationId!==correlationId||!('observation' in reply)||
    !isBmadConfigurationObservation(reply.observation)||reply.observation.projectId!==projectId)throw Error('INVALID_INITIALIZATION_OBSERVATION')
 return reply.observation
},read:()=>contextRequest({type:'read'}),observe:projectId=>contextRequest({type:'observe',projectId}),choose:(projectId,initiativeId,revision)=>contextRequest({type:'choose',projectId,initiativeId,revision}),retrySave:projectId=>contextRequest({type:'retry-save',projectId}),onChanged:listener=>{const receive=(_event:Electron.IpcRendererEvent,value:unknown):void=>{if(isBmadContextState(value))listener(value)};ipcRenderer.on(BMAD_CONTEXT_EVENT_CHANNEL,receive);return()=>ipcRenderer.removeListener(BMAD_CONTEXT_EVENT_CHANNEL,receive)}}
contextBridge.exposeInMainWorld('madnessBmadContext',Object.freeze(bmadContextBridge))

import {BMAD_PROGRESS_COMMAND_CHANNEL,BMAD_PROGRESS_EVENT_CHANNEL,isBmadProgressState} from '../contracts/bmad-progress.ts'
import type {BmadProgressBridge,BmadProgressState} from '../contracts/bmad-progress.ts'
const progressRequest=async(payload:Record<string,unknown>):Promise<BmadProgressState>=>{
 const correlationId=crypto.randomUUID(),reply:unknown=await ipcRenderer.invoke(BMAD_PROGRESS_COMMAND_CHANNEL,{...payload,contractVersion:1,correlationId})
 if(!reply||typeof reply!=='object'||!('state' in reply)||!('correlationId' in reply)||reply.correlationId!==correlationId||!isBmadProgressState(reply.state))throw Error('INVALID_PROGRESS_REPLY')
 return reply.state
}
const bmadProgressBridge:BmadProgressBridge={read:()=>progressRequest({type:'read'}),collect:projectId=>progressRequest({type:'collect',projectId}),onChanged:listener=>{const receive=(_event:Electron.IpcRendererEvent,value:unknown):void=>{if(isBmadProgressState(value))listener(value)};ipcRenderer.on(BMAD_PROGRESS_EVENT_CHANNEL,receive);return()=>ipcRenderer.removeListener(BMAD_PROGRESS_EVENT_CHANNEL,receive)}}
contextBridge.exposeInMainWorld('madnessBmadProgress',Object.freeze(bmadProgressBridge))


import {BMAD_CATALOG_COMMAND_CHANNEL,BMAD_CATALOG_EVENT_CHANNEL,isBmadCatalogState} from '../contracts/bmad-catalog.ts'
import type {BmadCatalogBridge,BmadCatalogState} from '../contracts/bmad-catalog.ts'
const catalogRequest=async(payload:Record<string,unknown>):Promise<BmadCatalogState>=>{
 const correlationId=crypto.randomUUID(),reply=await ipcRenderer.invoke(BMAD_CATALOG_COMMAND_CHANNEL,{contractVersion:1,correlationId,...payload})
 if(!reply||typeof reply!=='object'||!('state' in reply)||!('correlationId' in reply)||reply.correlationId!==correlationId||!isBmadCatalogState(reply.state))throw Error('INVALID_CATALOG_REPLY')
 return reply.state
}
const bmadCatalogBridge:BmadCatalogBridge={read:()=>catalogRequest({type:'read'}),collect:projectId=>catalogRequest({type:'collect',projectId}),copy:(projectId,itemId,revision)=>catalogRequest({type:'copy',projectId,itemId,revision}),onChanged:listener=>{const receive=(_event:Electron.IpcRendererEvent,value:unknown):void=>{if(isBmadCatalogState(value))listener(value)};ipcRenderer.on(BMAD_CATALOG_EVENT_CHANNEL,receive);return()=>ipcRenderer.removeListener(BMAD_CATALOG_EVENT_CHANNEL,receive)}}
contextBridge.exposeInMainWorld('madnessBmadCatalog',Object.freeze(bmadCatalogBridge))

import {PROJECT_FILES_COMMAND_CHANNEL,PROJECT_FILES_EVENT_CHANNEL,isProjectFilesState} from '../contracts/project-files.ts'
import type {ProjectFilesBridge,ProjectFilesState} from '../contracts/project-files.ts'
const filesRequest=async(payload:Record<string,unknown>):Promise<ProjectFilesState>=>{
 const correlationId=crypto.randomUUID(),reply:unknown=await ipcRenderer.invoke(PROJECT_FILES_COMMAND_CHANNEL,{...payload,contractVersion:1,correlationId})
 if(!reply||typeof reply!=='object'||Object.keys(reply).length!==3||!('contractVersion' in reply)||reply.contractVersion!==1||!('state' in reply)||!('correlationId' in reply)||reply.correlationId!==correlationId||!isProjectFilesState(reply.state))throw Error('INVALID_FILES_REPLY')
 return reply.state
}
const projectFilesBridge:ProjectFilesBridge={read:()=>filesRequest({type:'read'}),preview:referenceId=>filesRequest({type:'preview',referenceId}),copy:referenceId=>filesRequest({type:'copy',referenceId}),editor:referenceId=>filesRequest({type:'editor',referenceId}),onChanged:listener=>{const receive=(_event:Electron.IpcRendererEvent,value:unknown):void=>{if(isProjectFilesState(value))listener(value)};ipcRenderer.on(PROJECT_FILES_EVENT_CHANNEL,receive);return()=>ipcRenderer.removeListener(PROJECT_FILES_EVENT_CHANNEL,receive)}}
contextBridge.exposeInMainWorld('projectFiles',Object.freeze(projectFilesBridge))

import {GRAPH_COMMAND_CHANNEL,GRAPH_EVENT_CHANNEL,isGraphWorkspace} from '../contracts/bmad-graph.ts'
import type {GraphBridge,GraphWorkspace} from '../contracts/bmad-graph.ts'
const graphRequest=async(payload:Record<string,unknown>):Promise<GraphWorkspace>=>{const correlationId=crypto.randomUUID(),reply:unknown=await ipcRenderer.invoke(GRAPH_COMMAND_CHANNEL,{...payload,contractVersion:1,correlationId});if(!reply||typeof reply!=='object'||Object.keys(reply).length!==3||!('contractVersion' in reply)||reply.contractVersion!==1||!('correlationId' in reply)||reply.correlationId!==correlationId||!('state' in reply)||!isGraphWorkspace(reply.state))throw Error('INVALID_GRAPH_REPLY');return reply.state}
const graphBridge:GraphBridge={read:()=>graphRequest({type:'read'}),generate:projectId=>graphRequest({type:'generate',projectId,scopeId:'code'}),interrupt:(projectId,analysisId)=>graphRequest({type:'interrupt',projectId,scopeId:'code',analysisId}),retrySave:projectId=>graphRequest({type:'retry-save',projectId,scopeId:'code'}),revalidateFiles:projectId=>graphRequest({type:'revalidate-files',projectId,scopeId:'code'}),onChanged:listener=>{const receive=(_event:Electron.IpcRendererEvent,value:unknown):void=>{if(isGraphWorkspace(value))listener(value)};ipcRenderer.on(GRAPH_EVENT_CHANNEL,receive);return()=>ipcRenderer.removeListener(GRAPH_EVENT_CHANNEL,receive)}}
contextBridge.exposeInMainWorld('madnessGraph',Object.freeze(graphBridge))

import {CATALOG_LAUNCH_COMMAND_CHANNEL,CATALOG_LAUNCH_EVENT_CHANNEL,isCatalogLaunchState} from '../contracts/bmad-catalog-launch.ts'
import type {CatalogLaunchBridge,CatalogLaunchState} from '../contracts/bmad-catalog-launch.ts'
const catalogLaunchRequest=async(payload:Record<string,unknown>):Promise<CatalogLaunchState>=>{
 const correlationId=crypto.randomUUID(),reply:unknown=await ipcRenderer.invoke(CATALOG_LAUNCH_COMMAND_CHANNEL,{...payload,contractVersion:1,correlationId})
 if(!reply||typeof reply!=='object'||Object.keys(reply).length!==3||!('contractVersion' in reply)||reply.contractVersion!==1||!('correlationId' in reply)||reply.correlationId!==correlationId||!('state' in reply)||!isCatalogLaunchState(reply.state))throw Error('INVALID_CATALOG_LAUNCH_REPLY')
 return reply.state
}
const catalogLaunchBridge:CatalogLaunchBridge={read:()=>catalogLaunchRequest({type:'read'}),prepare:(projectId,itemId,revision,mode='read-only')=>catalogLaunchRequest({type:'prepare',projectId,itemId,revision,mode}),cancel:preparationId=>catalogLaunchRequest({type:'cancel',preparationId}),retrySave:conversationId=>catalogLaunchRequest({type:'retry-save',conversationId}),onChanged:fn=>{const receive=(_event:Electron.IpcRendererEvent,v:unknown):void=>{if(isCatalogLaunchState(v))fn(v)};ipcRenderer.on(CATALOG_LAUNCH_EVENT_CHANNEL,receive);return()=>ipcRenderer.removeListener(CATALOG_LAUNCH_EVENT_CHANNEL,receive)}}
contextBridge.exposeInMainWorld('madnessCatalogLaunch',Object.freeze(catalogLaunchBridge))

import {US_METRICS_COMMAND_CHANNEL,US_METRICS_EVENT_CHANNEL,isUsMetricsState} from '../contracts/us-metrics.ts'
import type {UsMetricsBridge,UsMetricsState} from '../contracts/us-metrics.ts'
const metricsRequest=async(payload:Record<string,unknown>):Promise<UsMetricsState>=>{const correlationId=crypto.randomUUID(),reply:unknown=await ipcRenderer.invoke(US_METRICS_COMMAND_CHANNEL,{...payload,contractVersion:1,correlationId});if(!reply||typeof reply!=='object'||!('state' in reply)||!('correlationId' in reply)||reply.correlationId!==correlationId||!isUsMetricsState(reply.state))throw Error('INVALID_METRICS_REPLY');return reply.state}
const metricsBridge:UsMetricsBridge={read:projectId=>metricsRequest({type:'read',projectId}),retrySave:projectId=>metricsRequest({type:'retry-save',projectId}),choose:(projectId,conversationId,requestId,storyRef,text,operation)=>metricsRequest({type:'choose',projectId,conversationId,requestId,storyRef,text,operation}),onChanged:fn=>{const receive=(_event:Electron.IpcRendererEvent,value:unknown):void=>{if(isUsMetricsState(value))fn(value)};ipcRenderer.on(US_METRICS_EVENT_CHANNEL,receive);return()=>ipcRenderer.removeListener(US_METRICS_EVENT_CHANNEL,receive)}}
contextBridge.exposeInMainWorld('madnessUsMetrics',Object.freeze(metricsBridge))

import {INITIALIZATION_COMMAND_CHANNEL,INITIALIZATION_EVENT_CHANNEL,isInitializationReply,isInitializationView} from '../contracts/bmad-initialization.ts'
import type {InitializationBridge} from '../contracts/bmad-initialization.ts'
const initializationBridge:InitializationBridge={
 request:async input=>{
  const correlationId=input.type==='prepare'?input.requestId:crypto.randomUUID()
  const reply:unknown=await ipcRenderer.invoke(INITIALIZATION_COMMAND_CHANNEL,{...input,contractVersion:1,correlationId})
  if (!isInitializationReply(reply,{...input,correlationId})) throw Error('INVALID_INITIALIZATION_REPLY')
  if (reply.content&&(input.type!=='content'||reply.content.contentId!==input.contentId)) throw Error('INVALID_INITIALIZATION_CONTENT')
  return reply
 },
 onChanged:listener=>{
  const receive=(_event:Electron.IpcRendererEvent,value:unknown):void=>{if(isInitializationView(value))listener(value)}
  ipcRenderer.on(INITIALIZATION_EVENT_CHANNEL,receive)
  return ()=>ipcRenderer.removeListener(INITIALIZATION_EVENT_CHANNEL,receive)
 }
}
contextBridge.exposeInMainWorld('madnessBmadInitialization',Object.freeze(initializationBridge))
