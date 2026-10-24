import assert from 'node:assert/strict'
import { test } from 'node:test'
import { generateKeyPair, exportJWK, SignJWT, createLocalJWKSet } from 'jose'
const oauth = await import('../src/adapters/codex/oauth.ts').catch(() => null)
const { privateKey, publicKey } = await generateKeyPair('RS256')
const jwk = { ...await exportJWK(publicKey), kid: 'test-key', alg: 'RS256' }
const jwks = createLocalJWKSet({ keys: [jwk] })
const registration = { version: 1, hostId: 'urn:uuid:11111111-1111-4111-8111-111111111111', clientId: null }
const scope = 'openid profile email offline_access resource.invoke chatgpt.tokens.use.direct'
const signed = (nonce, overrides = {}, key = privateKey) => new SignJWT({ nonce, ...overrides }).setProtectedHeader({ alg: 'RS256', kid: 'test-key' }).setIssuer(overrides.iss ?? 'https://auth.openai.com').setAudience(overrides.aud ?? 'oaiapp_testclient').setSubject(overrides.sub ?? 'test-subject').setExpirationTime(overrides.exp ?? '5m').sign(key)
function start(behaviour = {}) {
  assert.ok(oauth, 'Le protocole OAuth doit exister')
  const controller = new AbortController()
  let authorization, form, requests = 0
  const done = oauth.authorize({ registration, previous: null, signal: controller.signal, jwks, timeoutMs: 1500,
    openExternal: async (value) => { authorization = new URL(value); await behaviour.open?.(authorization) },
    transport: async (url, options) => { requests++; assert.equal(url, 'https://auth.openai.com/api/accounts/oauth/token'); form = new URLSearchParams(options.body); return { access_token: 'private-access', refresh_token: 'private-refresh', id_token: await signed(authorization.searchParams.get('nonce'), behaviour.claims), token_type: 'Bearer', expires_in: 3600, scope, ...behaviour.token } }, ...behaviour.options })
  return { done, controller, get authorization() { return authorization }, get form() { return form }, get requests() { return requests } }
}
async function waitAuthorization(f) { while (!f.authorization) await new Promise((r) => setTimeout(r, 1)); return f.authorization }
const callback = (authorization, changes = {}) => {
  const url = new URL(authorization.searchParams.get('redirect_uri'))
  for (const [key, value] of Object.entries({ state: authorization.searchParams.get('state'), code: 'private-code', client_id: 'oaiapp_testclient', ...changes })) { if (value !== null) url.searchParams.set(key, value) }
  return url
}
test('OAuth loopback lie PKCE, nonce, client et redirect puis vérifie une vraie signature', async () => {
  const f = start(); const auth = await waitAuthorization(f)
  assert.equal(auth.origin + auth.pathname, 'https://auth.openai.com/api/accounts/authorize')
  assert.equal(auth.searchParams.get('client_id'), 'dynamic_agent_client')
  assert.equal(auth.searchParams.get('ext_agent_host_id'), registration.hostId)
  assert.equal(auth.searchParams.get('code_challenge_method'), 'S256')
  assert.match(auth.searchParams.get('state'), /^[a-zA-Z0-9_-]{40,}$/)
  const response = await fetch(callback(auth)); assert.equal(response.status, 200)
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer')
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert.equal((await response.text()).includes('private-code'), false)
  const result = await f.done
  assert.equal(result.subject, 'test-subject'); assert.equal(result.accessToken, 'private-access')
  assert.equal(f.form.get('client_id'), result.clientId)
  assert.equal(f.form.get('redirect_uri'), auth.searchParams.get('redirect_uri'))
  assert.ok(f.form.get('code_verifier').length >= 43)
  await assert.rejects(fetch(callback(auth)))
})
test('callbacks étrangers, doublons et client incorrect ne terminent pas l’attente', async () => {
  const f = start({ options: { registration: { ...registration, clientId: 'oaiapp_testclient' } } }); const auth = await waitAuthorization(f)
  const duplicate = callback(auth); duplicate.searchParams.append('state', 'duplicate')
  for (const url of [callback(auth, { state: 'attacker' }), duplicate, callback(auth, { client_id: 'oaiapp_other' })]) assert.equal((await fetch(url)).status, 400)
  assert.equal(f.requests, 0)
  assert.equal((await fetch(callback(auth))).status, 200)
  assert.equal((await f.done).clientId, 'oaiapp_testclient')
})
test('la réautorisation reprend le client enregistré si le callback omet client_id et omet le hint initial', async () => {
  const f = start({ options: { registration: { ...registration, clientId: 'oaiapp_testclient' } } })
  const auth = await waitAuthorization(f)
  try {
    assert.equal(auth.searchParams.get('client_id'), 'oaiapp_testclient')
    assert.equal(auth.searchParams.has('agent_name_hint'), false)
    assert.equal((await fetch(callback(auth, { client_id: 'oaiapp_other' }))).status, 400)
    assert.equal(f.requests, 0)
    assert.equal((await fetch(callback(auth, { client_id: null }))).status, 200)
    assert.equal((await f.done).clientId, 'oaiapp_testclient')
    assert.equal(f.form.get('client_id'), 'oaiapp_testclient')
  } finally { f.controller.abort(); await f.done.catch(() => {}) }
})
test('refus de consentement ne tente aucun échange et ferme le listener', async () => {
  const f = start(); const auth = await waitAuthorization(f); const done = assert.rejects(f.done, { code: 'CONSENT_DENIED' })
  await fetch(callback(auth, { code: null, error: 'access_denied', client_id: null })); await done
  assert.equal(f.requests, 0); await assert.rejects(fetch(callback(auth)))
})
for (const [label, claims] of [['nonce', { nonce: 'invalid' }], ['audience', { aud: 'attacker' }], ['issuer', { iss: 'https://evil.test' }], ['expiration', { exp: 1 }], ['authorized party', { azp: 'attacker' }], ['audiences multiples sans authorized party', { aud: ['oaiapp_testclient', 'attacker'] }]]) test(`ID token avec ${label} invalide refusé`, async () => {
  const f = start({ claims }); const auth = await waitAuthorization(f); const done = assert.rejects(f.done, { code: 'OAUTH_INVALID' }); await fetch(callback(auth)); await done
})
test('scopes insuffisants et changement d’identité refusés', async () => {
  for (const behaviour of [{ token: { scope: 'openid' }, code: 'SCOPES_MISSING' }, { options: { previous: { subject: 'other-person', planAcknowledged: false } }, code: 'IDENTITY_CHANGED' }]) {
    const f = start(behaviour); const auth = await waitAuthorization(f); const done = assert.rejects(f.done, { code: behaviour.code }); await fetch(callback(auth)); await done
  }
})
test('signature forgée refusée au lieu du seul décodage JWT', async () => {
  assert.ok(oauth)
  const rogue = await generateKeyPair('RS256')
  const token = await signed('nonce', {}, rogue.privateKey)
  await assert.rejects(oauth.validateIdentity(token, { clientId: 'oaiapp_testclient', nonce: 'nonce', jwks }), { code: 'OAUTH_INVALID' })
})
test('annulation, timeout et navigateur défaillant ferment le listener', async () => {
  const f = start(); const auth = await waitAuthorization(f); const done = assert.rejects(f.done, { code: 'CANCELLED' }); f.controller.abort(); await done; await assert.rejects(fetch(callback(auth)))
  const timeout = start({ options: { timeoutMs: 30 } }); await assert.rejects(timeout.done, { code: 'TIMEOUT' })
  const browser = start({ open: () => { throw Error('private URL') } }); await assert.rejects(browser.done, { code: 'BROWSER_UNAVAILABLE' })
})
test('refresh tourne le jeton seulement à la demande et refuse une autre identité', async () => {
  assert.ok(oauth)
  const previous = { version: 1, clientId: 'oaiapp_testclient', subject: 'test-subject', accessToken: 'old-access', refreshToken: 'old-refresh', idToken: 'old-id', expiresAt: 1, scopes: scope.split(' '), planAcknowledged: true }
  let form
  const options = { signal: new AbortController().signal, jwks, transport: async (_url, request) => { form = new URLSearchParams(request.body); return { access_token: 'new-access', refresh_token: 'new-refresh', token_type: 'Bearer', expires_in: 3600 } } }
  const value = await oauth.refreshCredentials(previous, options)
  assert.equal(value.refreshToken, 'new-refresh'); assert.equal(previous.refreshToken, 'old-refresh'); assert.equal(form.get('grant_type'), 'refresh_token'); assert.equal(form.get('resource'), 'https://api.openai.com/v1')
  await assert.rejects(oauth.refreshCredentials(previous, { ...options, transport: async () => ({ access_token: 'new-access', token_type: 'Bearer', expires_in: 3600, id_token: await signed('unused', { sub: 'attacker' }) }) }), { code: 'IDENTITY_CHANGED' })
})
test('transport borne les tailles, refuse les destinations et les redirections', async () => {
  assert.ok(oauth)
  const signal = new AbortController().signal
  let options
  const transport = oauth.createTransport(async (_url, value) => { options = value; return new Response('x'.repeat(262145)) })
  await assert.rejects(transport('https://evil.test', { method: 'GET', signal }), { code: 'NETWORK_UNAVAILABLE' })
  await assert.rejects(transport('https://auth.openai.com/.well-known/jwks.json', { method: 'GET', signal }), { code: 'NETWORK_UNAVAILABLE' })
  assert.equal(options.redirect, 'error'); assert.equal(options.credentials, 'omit')
})
test('un navigateur qui ne répond pas reste annulable et libère le listener', { timeout: 500 }, async () => {
  const f = start({ open: () => new Promise(() => {}) }); const auth = await waitAuthorization(f)
  const done = assert.rejects(f.done, { code: 'CANCELLED' }); f.controller.abort()
  await done; await assert.rejects(fetch(callback(auth)))
})
