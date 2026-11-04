import { createServer } from 'node:http'
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto'
import { createLocalJWKSet, importJWK, jwtVerify } from 'jose'
import type { JWTVerifyGetKey, JSONWebKeySet } from 'jose'
import { connectionError, connectionFailure } from '../../contracts/connection.ts'
import {PUBLIC_KEYS_URL} from '../../contracts/connection.ts'
import { isRecord } from '../../contracts/index.ts'
import { isIssuedClientId, isCredentials } from './vault.ts'
import type { Credentials, Registration } from './vault.ts'
const issuer = 'https://auth.openai.com'
const tokenEndpoint = issuer + '/api/accounts/oauth/token'
const resource = 'https://api.openai.com/v1'
export const requiredScopes = ['openid', 'profile', 'email', 'offline_access', 'resource.invoke', 'chatgpt.tokens.use.direct']
export type Transport = (url: string, options: { method: 'GET' | 'POST'; body?: string; signal: AbortSignal }) => Promise<unknown>
/** Transport Electron Main : certificats/proxy système, aucune redirection ou sortie brute. */
export function createTransport(fetcher: typeof fetch): Transport {
  return async (url, options) => {
    if (![tokenEndpoint, issuer + '/.well-known/jwks.json'].includes(url)) throw connectionFailure('NETWORK_UNAVAILABLE')
    const signal = AbortSignal.any([options.signal, AbortSignal.timeout(15000)])
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined
    let body: ReadableStream<Uint8Array> | null = null
    try {
      const response = await fetcher(url, { method: options.method, body: options.body, signal, redirect: 'error', credentials: 'omit', headers: { Accept: 'application/json', ...(options.method === 'POST' ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}) } })
      body = response.body
      if (!response.ok || !response.body || Number(response.headers.get('content-length') ?? 0) > 262144) throw connectionFailure('NETWORK_UNAVAILABLE')
      reader = response.body.getReader()
      const chunks: Uint8Array[] = []; let size = 0
      for (;;) { const { value, done } = await reader.read(); if (done) break; size += value.byteLength; if (size > 262144) throw connectionFailure('NETWORK_UNAVAILABLE'); chunks.push(value) }
      return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown
    } catch { throw connectionFailure(options.signal.aborted ? 'CANCELLED' : signal.aborted ? 'TIMEOUT' : 'NETWORK_UNAVAILABLE') }
    finally { if (reader) { await reader.cancel().catch(() => {}); reader.releaseLock() } else await body?.cancel().catch(() => {}) }
  }
}
/** Réseau seul : aucun coffre, OAuth, rotation, probe ni modèle. */
export async function checkPublicKeysAccess(transport:Transport,signal:AbortSignal):Promise<void>{
 const value=await transport(PUBLIC_KEYS_URL,{method:'GET',signal});signal.throwIfAborted()
 if(!isRecord(value)||!Array.isArray(value.keys)||value.keys.length>30||!value.keys.every(isRecord))throw connectionFailure('NETWORK_UNAVAILABLE')
}
function same(left: string, right: string): boolean { const a = Buffer.from(left), b = Buffer.from(right); return a.length === b.length && timingSafeEqual(a, b) }
async function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  signal.throwIfAborted()
  let abort!: () => void
  try { return await Promise.race([promise, new Promise<never>((_, reject) => { abort = () => reject(connectionFailure('CANCELLED')); signal.addEventListener('abort', abort, { once: true }) })]) }
  finally { signal.removeEventListener('abort', abort) }
}
function scopes(value: unknown): string[] {
  if (typeof value !== 'string' || value.length > 4096) throw connectionFailure('SCOPES_MISSING')
  const values = value.split(/\s+/).filter(Boolean)
  if (!requiredScopes.every((scope) => values.includes(scope))) throw connectionFailure('SCOPES_MISSING')
  return values
}
export async function validateIdentity(token: string, options: { clientId: string; nonce?: string; subject?: string; jwks: JWTVerifyGetKey }): Promise<string> {
  try {
    const { payload } = await jwtVerify(token, options.jwks, { issuer, audience: options.clientId, algorithms: ['RS256'], requiredClaims: ['iss', 'aud', 'exp', 'sub'], clockTolerance: 5 })
    if (typeof payload.sub !== 'string' || !payload.sub || options.nonce !== undefined && (typeof payload.nonce !== 'string' || !same(payload.nonce, options.nonce))) throw connectionFailure('OAUTH_INVALID')
    if (payload.azp !== undefined && payload.azp !== options.clientId || Array.isArray(payload.aud) && payload.aud.length > 1 && payload.azp !== options.clientId) throw connectionFailure('OAUTH_INVALID')
    if (options.subject !== undefined && payload.sub !== options.subject) throw connectionFailure('IDENTITY_CHANGED')
    return payload.sub
  } catch (error) { throw connectionFailure(connectionError(error, 'OAUTH_INVALID')) }
}
async function getKeys(transport: Transport, signal: AbortSignal, provided?: JWTVerifyGetKey): Promise<JWTVerifyGetKey> {
  if (provided) return provided
  const keys = await transport(issuer + '/.well-known/jwks.json', { method: 'GET', signal })
  if (!isRecord(keys) || !Array.isArray(keys.keys) || keys.keys.length > 30) throw connectionFailure('OAUTH_INVALID')
  try {
    const set = keys as unknown as JSONWebKeySet
    const resolveKey = createLocalJWKSet(set)
    const signingKeys = set.keys.filter(key => key.kty === 'RSA' && (key.alg === undefined || key.alg === 'RS256') && (key.use === undefined || key.use === 'sig') && (key.key_ops === undefined || key.key_ops.includes('verify')))
    if (!signingKeys.length) throw connectionFailure('OAUTH_INVALID')
    for (const key of signingKeys) {
      const imported = await importJWK(key, 'RS256')
      if (imported instanceof Uint8Array || imported.type !== 'public' || !('modulusLength' in imported.algorithm) || Number(imported.algorithm.modulusLength) < 2048) throw connectionFailure('OAUTH_INVALID')
    }
    return resolveKey
  } catch { throw connectionFailure('OAUTH_INVALID') }
}
async function credentialsFrom(value: unknown, options: { clientId: string; nonce?: string; previous: Credentials | null; transport: Transport; signal: AbortSignal; jwks?: JWTVerifyGetKey; refresh?: boolean }): Promise<Credentials> {
  if (!isRecord(value) || typeof value.access_token !== 'string' || value.token_type !== 'Bearer' || !Number.isSafeInteger(value.expires_in) || Number(value.expires_in) <= 0 || Number(value.expires_in) > 31536000) throw connectionFailure('OAUTH_INVALID')
  const granted = options.refresh && value.scope === undefined && options.previous ? options.previous.scopes : scopes(value.scope)
  if (!requiredScopes.every((scope) => granted.includes(scope))) throw connectionFailure('SCOPES_MISSING')
  let subject = options.previous?.subject
  if (typeof value.id_token === 'string') {
    const keys = await getKeys(options.transport, options.signal, options.jwks)
    subject = await validateIdentity(value.id_token, { clientId: options.clientId, nonce: options.nonce, subject: options.previous?.subject, jwks: keys })
  } else if (!options.refresh || !options.previous) throw connectionFailure('OAUTH_INVALID')
  const credentials: Credentials = { version: 1, clientId: options.clientId, subject: subject!, accessToken: value.access_token, refreshToken: typeof value.refresh_token === 'string' ? value.refresh_token : options.refresh ? options.previous!.refreshToken : '', idToken: typeof value.id_token === 'string' ? value.id_token : options.previous!.idToken, expiresAt: Date.now() + Number(value.expires_in) * 1000, scopes: granted, planAcknowledged: options.previous?.planAcknowledged ?? false }
  if (!isCredentials(credentials)) throw connectionFailure('OAUTH_INVALID')
  return credentials
}
type AuthorizeOptions = { registration: Registration; previous: Credentials | null; signal: AbortSignal; transport: Transport; openExternal(url: string): Promise<void>; saveClientId?(value: string): Promise<void>; timeoutMs?: number; jwks?: JWTVerifyGetKey }
export async function authorize(options: AuthorizeOptions): Promise<Credentials> {
  const controller = new AbortController()
  const signal = AbortSignal.any([options.signal, controller.signal])
  const timer = setTimeout(() => controller.abort(connectionFailure('TIMEOUT')), options.timeoutMs ?? 600000)
  const state = randomBytes(32).toString('base64url'), nonce = randomBytes(32).toString('base64url'), verifier = randomBytes(48).toString('base64url')
  let resolveCallback!: (value: { code: string; clientId: string }) => void, rejectCallback!: (error: unknown) => void
  const callback = new Promise<{ code: string; clientId: string }>((resolve, reject) => { resolveCallback = resolve; rejectCallback = reject })
  void callback.catch(() => {}) // Le refus peut précéder le retour du navigateur système.
  let consumed = false, redirect = ''
  const server = createServer({ maxHeaderSize: 16384 }, (request, response) => {
    response.setHeader('Content-Type', 'text/html; charset=utf-8'); response.setHeader('Cache-Control', 'no-store'); response.setHeader('Referrer-Policy', 'no-referrer'); response.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'"); response.setHeader('X-Content-Type-Options', 'nosniff'); response.setHeader('Connection', 'close')
    const answer = (status: number, message: string): void => { response.writeHead(status); response.end('<!doctype html><html lang="fr"><meta charset="utf-8"><title>Madness</title><p>' + message + '</p></html>') }
    try {
      if (consumed || request.method !== 'GET' || !request.url || request.url.length > 8192 || request.headers.host !== new URL(redirect).host) return answer(400, 'Retour non reconnu. Revenez dans Madness.')
      const url = new URL(request.url, redirect)
      if (url.origin !== new URL(redirect).origin || url.pathname !== '/auth/callback' || url.hash) return answer(400, 'Retour non reconnu. Revenez dans Madness.')
      for (const key of url.searchParams.keys()) if (url.searchParams.getAll(key).length !== 1) return answer(400, 'Retour non reconnu. Revenez dans Madness.')
      if (!same(url.searchParams.get('state') ?? '', state)) return answer(400, 'Retour non reconnu. Revenez dans Madness.')
      if (url.searchParams.has('error')) { consumed = true; answer(200, 'Connexion refusée. Revenez dans Madness.'); rejectCallback(connectionFailure('CONSENT_DENIED')); return }
      const clientId = url.searchParams.get('client_id') ?? options.registration.clientId, code = url.searchParams.get('code')
      if (!isIssuedClientId(clientId) || options.registration.clientId !== null && options.registration.clientId !== clientId || !code || code.length > 4096 || url.searchParams.has('iss') && url.searchParams.get('iss') !== issuer) return answer(400, 'Retour non reconnu. Revenez dans Madness.')
      consumed = true; answer(200, 'Retour reçu. Madness vérifie maintenant la connexion. Vous pouvez fermer cet onglet.'); resolveCallback({ code, clientId })
    } catch { answer(400, 'Retour non reconnu. Revenez dans Madness.') }
  })
  server.requestTimeout = 5000; server.headersTimeout = 5000; server.keepAliveTimeout = 1; server.maxRequestsPerSocket = 1
  const abort = (): void => { rejectCallback(connectionFailure(options.signal.aborted ? 'CANCELLED' : 'TIMEOUT')); server.closeAllConnections(); server.close() }
  signal.addEventListener('abort', abort, { once: true })
  try {
    signal.throwIfAborted()
    await new Promise<void>((resolve, reject) => { server.once('error', () => reject(connectionFailure('OAUTH_INVALID'))); server.listen(0, '127.0.0.1', () => resolve()) })
    const address = server.address()
    if (!address || typeof address === 'string') throw connectionFailure('OAUTH_INVALID')
    redirect = `http://127.0.0.1:${address.port}/auth/callback`
    const authorization = new URL(issuer + '/api/accounts/authorize')
    for (const [name, value] of Object.entries({ client_id: options.registration.clientId ?? 'dynamic_agent_client', ...(options.registration.clientId === null ? { agent_name_hint: 'Madness' } : {}), ext_agent_host_id: options.registration.hostId, response_type: 'code', scope: requiredScopes.join(' '), resource, redirect_uri: redirect, state, nonce, code_challenge: createHash('sha256').update(verifier).digest('base64url'), code_challenge_method: 'S256' })) authorization.searchParams.set(name, value)
    signal.throwIfAborted()
    try { await abortable(options.openExternal(authorization.href), signal) } catch { throw connectionFailure('BROWSER_UNAVAILABLE') }
    const returned = await callback
    signal.throwIfAborted()
    await options.saveClientId?.(returned.clientId)
    const body = new URLSearchParams({ grant_type: 'authorization_code', client_id: returned.clientId, code: returned.code, code_verifier: verifier, redirect_uri: redirect, resource }).toString()
    const value = await options.transport(tokenEndpoint, { method: 'POST', body, signal })
    signal.throwIfAborted()
    return await credentialsFrom(value, { clientId: returned.clientId, nonce, previous: options.previous, transport: options.transport, signal, jwks: options.jwks })
  } catch (error) { throw connectionFailure(signal.aborted ? options.signal.aborted ? 'CANCELLED' : 'TIMEOUT' : connectionError(error, 'OAUTH_INVALID')) }
  finally { clearTimeout(timer); signal.removeEventListener('abort', abort); server.closeAllConnections(); if (server.listening) await new Promise<void>((resolve) => server.close(() => resolve())) }
}
/** Appel uniquement à la demande de vérification ; la rotation est sauvegardée par le service. */
export async function refreshCredentials(previous: Credentials, options: { signal: AbortSignal; transport: Transport; jwks?: JWTVerifyGetKey }): Promise<Credentials> {
  options.signal.throwIfAborted()
  // Une indisponibilité JWKS doit précéder toute rotation du refresh token.
  const jwks = await getKeys(options.transport, options.signal, options.jwks)
  options.signal.throwIfAborted()
  const body = new URLSearchParams({ grant_type: 'refresh_token', client_id: previous.clientId, refresh_token: previous.refreshToken, resource }).toString()
  const value = await options.transport(tokenEndpoint, { method: 'POST', body, signal: options.signal })
  options.signal.throwIfAborted()
  return credentialsFrom(value, { clientId: previous.clientId, previous, ...options, jwks, refresh: true })
}
