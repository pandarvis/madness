import assert from 'node:assert/strict'
import { test, after } from 'node:test'
import { writeFileSync, readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { generateKeyPair, exportJWK, SignJWT, createLocalJWKSet, createRemoteJWKSet, jwksCache, customFetch } from 'jose'
import * as prototype from './prototype.mjs'
import { refreshCredentials, validateIdentity, createTransport, requiredScopes } from '../../../src/adapters/codex/oauth.ts'
import { CodexConnection } from '../../../src/adapters/codex/connection.ts'
import { Application } from '../../../src/core/application.ts'
import { emptySnapshot, isSnapshot, isReply } from '../../../src/contracts/index.ts'

// No personal endpoint is reachable from this process. All OAuth-shaped values are synthetic.
globalThis.fetch = async () => { throw Error('EXTERNAL_NETWORK_DISABLED') }
const output = { schemaVersion: 1, scope: 'isolated-synthetic-no-personal-network', cases: [] }
const signal = () => new AbortController().signal
const fail = code => Object.assign(Error(code), { code })
const pair = await generateKeyPair('RS256', { extractable: true })
const rotated = await generateKeyPair('RS256')
const key = { ...await exportJWK(pair.publicKey), kid: 'fixture-a', alg: 'RS256', use: 'sig' }
const keyB = { ...await exportJWK(rotated.publicKey), kid: 'fixture-b', alg: 'RS256', use: 'sig' }
const keys = { keys: [key] }
const signed = (claims = {}, signing = pair.privateKey, kid = key.kid) => new SignJWT({ ...claims }).setProtectedHeader({ alg: 'RS256', kid }).setIssuer(claims.iss ?? 'https://auth.openai.com').setAudience(claims.aud ?? 'oaiapp_fixture').setSubject(claims.sub ?? 'fixture-subject').setExpirationTime(claims.exp ?? '5m').sign(signing)
const previous = () => ({ version: 1, clientId: 'oaiapp_fixture', subject: 'fixture-subject', accessToken: 'synthetic-old-access', refreshToken: 'synthetic-old-refresh', idToken: 'synthetic-old-id', expiresAt: 1, scopes: [...requiredScopes], planAcknowledged: true })
const tokenResponse = async (options = {}) => ({ access_token: 'synthetic-next-access', refresh_token: 'synthetic-next-refresh', id_token: await signed(), token_type: 'Bearer', expires_in: 3600, ...options })
const clock = () => ({ wall: 1_800_000_000_000, mono: 1000, advance(ms) { this.wall += ms; this.mono += ms } })
const response = (value = keys, headers = {}) => new Response(JSON.stringify(value), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600', ...headers } })
// Experimental assembly, private to these scenarios; never imported by the product.
async function refreshCandidate(value, cache, options) {
  // A supplied resolver bypasses the shipped pre-POST getKeys call. Establish
  // validated, currently usable candidate keys for every intention before that bypass.
  await cache.get(options.signal)
  return refreshCredentials(value, { ...options, jwks: cache.resolver(options.signal) })
}
function scenario(id, name, body) {
  test(`${id} ${name}`, async () => {
    try { const measures = await body(); output.cases.push({ id, name, status: 'passed', ...measures }) }
    catch (error) { output.cases.push({ id, name, status: 'failed', error: error.code ?? error.name }); throw error }
  })
}
after(() => {
  const files = ['src/adapters/codex/oauth.ts', 'src/adapters/codex/connection.ts', 'src/renderer/src/NetworkHelp.tsx', 'src/contracts/connection.ts', 'tests/connection-oauth.test.mjs', 'node_modules/jose/dist/webapi/jwks/remote.js', 'node_modules/jose/dist/webapi/jwks/local.js', 'package.json', 'package-lock.json']
  output.inputs = files.map(path => ({ path, sha256: createHash('sha256').update(readFileSync(new URL('../../../' + path, import.meta.url))).digest('hex') }))
  output.runtime = { node: process.versions.node, jose: JSON.parse(readFileSync(new URL('../../../node_modules/jose/package.json', import.meta.url))).version, electronInstalled: JSON.parse(readFileSync(new URL('../../../node_modules/electron/package.json', import.meta.url))).version }
  output.total = output.cases.length; output.passed = output.cases.filter(c => c.status === 'passed').length
  writeFileSync(new URL('./results.json', import.meta.url), JSON.stringify(output, null, 2) + '\n')
})

scenario('M1.1', 'four explicit refresh intentions compare application GETs, POSTs and simulated reopen', async () => {
  assert.equal(typeof prototype.KeyCache, 'function', 'candidate cache must implement executable policy')
  const rows = []
  for (const strategy of ['none', 'memory', 'persistent-untrusted', 'revalidate']) {
    const time = clock(), storage = {}; let gets = 0, posts = 0, notModified = 0
    const fetcher = async (_url, options) => {
      gets++
      if (options.headers['If-None-Match']) { notModified++; return new Response(null, { status: 304, headers: { etag: '"fixture"', 'cache-control': 'public, max-age=600' } }) }
      return response(keys, { etag: '"fixture"' })
    }
    let cache = new prototype.KeyCache({ fetcher, time, strategy, storage })
    const transport = async (_url, request) => {
      if (request.method === 'GET') return (await cache.get(request.signal)).jwks
      posts++; return tokenResponse()
    }
    for (let i = 0; i < 4; i++) {
      if (i === 3) cache = new prototype.KeyCache({ fetcher, time, strategy, storage })
      assert.equal((await refreshCredentials(previous(), { signal: signal(), transport })).subject, 'fixture-subject')
      time.advance(60_000)
    }
    rows.push({ strategy, gets, posts, notModified })
  }
  assert.deepEqual(rows, [
    { strategy: 'none', gets: 4, posts: 4, notModified: 0 },
    { strategy: 'memory', gets: 2, posts: 4, notModified: 0 },
    { strategy: 'persistent-untrusted', gets: 2, posts: 4, notModified: 0 },
    { strategy: 'revalidate', gets: 4, posts: 4, notModified: 2 }
  ])
  return { timelineSeconds: [0, 60, 120, 180], reopenBeforeIntention: 4, rows, actualHumanClicksMeasured: false }
})

scenario('M1.2', 'no policy header yields no invented reuse; candidate caps have explicit withdrawal windows', async () => {
  const rows = []
  for (const capMs of [60_000, 300_000, 600_000]) {
    const time = clock(); let gets = 0
    const cache = new prototype.KeyCache({ fetcher: async () => { gets++; return response() }, time, capMs })
    for (const delta of [0, 60_000, 60_000, 60_000, 120_000, 300_000]) { time.advance(delta); await cache.get(signal()) }
    rows.push({ capSeconds: capMs / 1000, gets, maximumRetainedWithdrawalSeconds: capMs / 1000 })
  }
  assert.deepEqual(rows.map(r => r.gets), [6, 3, 2])
  let gets = 0
  const cache = new prototype.KeyCache({ time: clock(), fetcher: async () => { gets++; return new Response(JSON.stringify(keys), { headers: { 'content-type': 'application/json' } }) } })
  await cache.get(signal()); await cache.get(signal()); assert.equal(gets, 2)
  // A synthetic one-hour credential lifetime exercises the shipped on-demand gate:
  // opening four dialogues is not four refresh intentions when the first one saved valid credentials.
  let stored = previous(), onDemandGets = 0, onDemandPosts = 0, writes = 0
  let nowMs = Date.now()
  const connection = new CodexConnection({
    vault: { read: async () => structuredClone(stored), write: async value => { writes++; stored = structuredClone(value) } },
    oauth: async () => { throw Error('FORBIDDEN_OAUTH') }, probe: async () => { throw Error('FORBIDDEN_PROBE') },
    refresh: (value, abort) => refreshCredentials(value, { signal: abort, transport: async (_url, request) => {
      if (request.method === 'GET') { onDemandGets++; return keys }
      onDemandPosts++; return tokenResponse()
    } }), now: () => new Date(nowMs), openUsage: async () => {}, openPublicKeys: async () => {}, copyPublicKeys: async () => {}
  })
  for (let i = 0; i < 4; i++) { const lease = await connection.acquireDialogue(signal()); lease.release(); nowMs += 60_000 }
  assert.deepEqual({ onDemandGets, onDemandPosts, writes }, { onDemandGets: 1, onDemandPosts: 1, writes: 1 })
  await connection.shutdown()
  return { sensitivity: rows, missingHeadersGets: gets, refreshCadence: 'simulated-only', actualServiceWithSynthetic3600sCredential: { dialogueIntentions: 4, gets: onDemandGets, posts: onDemandPosts, writes } }
})

scenario('M2.1', 'Age, Date and transfer delay consume freshness; boundary and network failure never extend it', async () => {
  const time = clock(); let gets = 0, blocked = false
  const cache = new prototype.KeyCache({ time, fetcher: async () => { gets++; if (blocked) throw fail('NETWORK_UNAVAILABLE'); time.advance(5000); return response(keys, { age: '10', date: new Date(time.wall - 20_000).toUTCString(), 'cache-control': 'max-age=60' }) } })
  const first = await cache.get(signal()); assert.equal(first.remainingMs, 40_000)
  time.advance(39_999); assert.equal((await cache.get(signal())).provenance, 'memory-fresh'); assert.equal(gets, 1)
  time.advance(1); blocked = true
  await assert.rejects(cache.get(signal()), { code: 'NETWORK_UNAVAILABLE' })
  await assert.rejects(cache.get(signal()), { code: 'NETWORK_UNAVAILABLE' })
  assert.equal(gets, 3); assert.equal(cache.describe().fresh, false)
  return { remainingAtReceiptMs: first.remainingMs, failureGets: gets - 1, staleFallback: false }
})

scenario('M2.2', 'restrictive, malformed and contradictory directives fail closed for reuse', async () => {
  const cases = [
    { 'cache-control': 'no-store, max-age=600' }, { 'cache-control': 'no-cache, max-age=600' },
    { 'cache-control': 'max-age=600, max-age=900' }, { 'cache-control': 'max-age=invalid' },
    { 'cache-control': 'max-age=600', age: '-1' }, { 'cache-control': 'max-age=600', age: 'invalid' },
    { 'cache-control': 'max-age=600', age: '99999' }, { 'cache-control': 'max-age=600', date: 'invalid' }
  ]
  for (const headers of cases) {
    let gets = 0; const storage = {}
    const cache = new prototype.KeyCache({ time: clock(), strategy: 'persistent-untrusted', storage, fetcher: async () => { gets++; return response(keys, headers) } })
    await cache.get(signal()); await cache.get(signal()); assert.equal(gets, 2)
    if (headers['cache-control'].includes('no-store')) assert.equal(storage.record, undefined)
  }
  return { directiveCases: cases.length, automaticReuse: false }
})

scenario('M2.3', 'backward wall or monotonic clocks invalidate; persistent tampering is never a trust root', async () => {
  for (const axis of ['wall', 'mono']) {
    const time = clock(); let gets = 0
    const cache = new prototype.KeyCache({ time, fetcher: async () => { gets++; return response() } })
    await cache.get(signal()); time[axis]--; await cache.get(signal()); assert.equal(gets, 2)
  }
  for (const axis of ['wall', 'mono']) {
    const time = clock(); let gets = 0
    const cache = new prototype.KeyCache({ time, fetcher: async () => { gets++; return response() } })
    await cache.get(signal()); time.advance(60_000); await cache.get(signal())
    time[axis]--; await cache.get(signal()); assert.equal(gets, 2, 'rollback after an earlier hit must also invalidate')
  }
  const storage = {}; const time = clock()
  const seed = new prototype.KeyCache({ time, storage, strategy: 'persistent-untrusted', fetcher: async () => response() })
  const first = await seed.get(signal()); first.jwks.keys[0].n = 'tampered-return-value'
  assert.equal((await seed.get(signal())).jwks.keys[0].n, key.n)
  storage.record = JSON.stringify({ jwks: { keys: [keyB] }, fetchedWall: time.wall + 1e12, digest: 'attacker-can-recompute-any-plain-hash' })
  const reopen = new prototype.KeyCache({ time, storage, strategy: 'persistent-untrusted', fetcher: async () => { throw fail('NETWORK_UNAVAILABLE') } })
  await assert.rejects(reopen.get(signal()), { code: 'NETWORK_UNAVAILABLE' })
  assert.equal(reopen.describe().restored, 'untrusted-discarded')
  return { clockAxesRejected: 2, returnedCloneIsolated: true, untrustedReopenAccepted: false }
})

scenario('M3.1', 'real signatures and issuer, audience, subject, expiry, nonce and azp are checked', async () => {
  const cache = new prototype.KeyCache({ time: clock(), fetcher: async () => response() })
  assert.equal(await cache.identity(await signed(), { clientId: 'oaiapp_fixture', subject: 'fixture-subject' }, signal()), 'fixture-subject')
  const invalid = [
    [await signed({}, rotated.privateKey), 'OAUTH_INVALID'], [await signed({ exp: 1 }), 'OAUTH_INVALID'],
    [await signed({ iss: 'https://other.invalid' }), 'OAUTH_INVALID'], [await signed({ aud: 'other-client' }), 'OAUTH_INVALID'],
    [await signed({ sub: 'other-subject' }), 'IDENTITY_CHANGED'], [await signed({ azp: 'other-client' }), 'OAUTH_INVALID'],
    [await signed({ aud: ['oaiapp_fixture', 'other-client'] }), 'OAUTH_INVALID']
  ]
  for (const [token, code] of invalid) await assert.rejects(cache.identity(token, { clientId: 'oaiapp_fixture', subject: 'fixture-subject' }, signal()), { code })
  await assert.rejects(cache.identity(await signed({ nonce: 'wrong' }), { clientId: 'oaiapp_fixture', nonce: 'expected' }, signal()), { code: 'OAUTH_INVALID' })
  return { validSignature: true, rejectedIdentities: invalid.length + 1, validator: 'shipped-validateIdentity' }
})

scenario('M3.2', 'unknown kid refresh is bounded; removal becomes effective by expiry', async () => {
  const time = clock(); let gets = 0, current = keys
  const cache = new prototype.KeyCache({ time, fetcher: async () => { gets++; return response(current) } })
  await cache.identity(await signed(), { clientId: 'oaiapp_fixture' }, signal())
  current = { keys: [key, keyB] }
  assert.equal(await cache.identity(await signed({}, rotated.privateKey, keyB.kid), { clientId: 'oaiapp_fixture' }, signal()), 'fixture-subject')
  assert.equal(gets, 2)
  for (let i = 0; i < 3; i++) await assert.rejects(cache.identity(await signed({}, pair.privateKey, 'missing-' + i), { clientId: 'oaiapp_fixture' }, signal()), { code: 'OAUTH_INVALID' })
  assert.equal(gets, 2)
  current = { keys: [keyB] }
  assert.equal(await cache.identity(await signed(), { clientId: 'oaiapp_fixture' }, signal()), 'fixture-subject')
  time.advance(300_000)
  await assert.rejects(cache.identity(await signed(), { clientId: 'oaiapp_fixture' }, signal()), { code: 'OAUTH_INVALID' })
  assert.ok(gets <= 4)
  return { gets, unknownKidAttempts: 3, withdrawnKeyAcceptedOnlyWhileFresh: true, removalBoundSeconds: 300 }
})

scenario('M3.3', 'malformed, empty, private and weak RSA sets fail before any POST', async () => {
  const privateJwk = { ...await exportJWK(pair.privateKey), kid: 'private', alg: 'RS256' }
  // An invalid modulus and an undersized public RSA key must both fail the application boundary.
  const tinyRsa = { kty: 'RSA', kid: 'tiny', alg: 'RS256', n: 'AQAB', e: 'AQAB' }
  for (const value of [null, {}, { keys: [] }, { keys: Array(31).fill(key) }, { keys: [privateJwk] }, { keys: [tinyRsa] }, { keys: [{ ...key, n: 'invalid' }] }]) {
    let posts = 0
    const cache = new prototype.KeyCache({ time: clock(), fetcher: async () => response(value) })
    await assert.rejects(refreshCredentials(previous(), { signal: signal(), transport: async (_url, request) => {
      if (request.method === 'GET') return (await cache.get(request.signal)).jwks
      posts++; return tokenResponse()
    } }), { code: 'OAUTH_INVALID' })
    assert.equal(posts, 0)
  }
  return { invalidSets: 7, posts: 0 }
})

scenario('M3.4', 'jose cache seed accepts attacker keys and future time without origin binding: reject persistence option', async () => {
  let fetches = 0
  const resolver = createRemoteJWKSet(new URL('https://not-the-seed-origin.invalid/keys'), {
    [jwksCache]: { uat: Date.now() + 1e12, jwks: { keys: [keyB] } },
    [customFetch]: async () => { fetches++; throw fail('NETWORK_DISABLED') }
  })
  assert.equal(await validateIdentity(await signed({}, rotated.privateKey, keyB.kid), { clientId: 'oaiapp_fixture', jwks: resolver }), 'fixture-subject')
  assert.equal(fetches, 0); assert.equal(resolver.fresh, true)
  return { counterexample: 'untrusted-jose-seed-would-validate-attacker-signature', fetches, futureTimestampAccepted: true, persistentOption: 'not-retained-without-separate-trust-boundary' }
})

scenario('M4.1', 'candidate and shipped transport reject 307, HTML, invalid JSON and oversized responses safely', async () => {
  const responses = [() => new Response('', { status: 307, headers: { location: 'https://external.invalid' } }), () => new Response('<html>warning</html>'), () => new Response('{broken'), () => new Response('x'.repeat(262145))]
  for (const make of responses) {
    let calls = 0
    const fetcher = async (url, options) => { calls++; assert.equal(url, 'https://auth.openai.com/.well-known/jwks.json'); assert.equal(options.redirect, 'error'); assert.equal(options.credentials, 'omit'); return make() }
    await assert.rejects(createTransport(fetcher)('https://auth.openai.com/.well-known/jwks.json', { method: 'GET', signal: signal() }), { code: 'NETWORK_UNAVAILABLE' })
    const cache = new prototype.KeyCache({ time: clock(), fetcher: async (url, options) => { assert.equal(options.cache, 'no-store'); return fetcher(url, options) } })
    await assert.rejects(cache.get(signal()), { code: 'NETWORK_UNAVAILABLE' })
    assert.equal(calls, 2)
  }
  return { responseCases: 4, redirectsFollowed: 0, transport: 'real-shipped-and-candidate' }
})

scenario('M4.2', 'timeout and cancellation are bounded and expunged; one cancelled waiter preserves another', async () => {
  const hang = (_url, options) => new Promise((_, reject) => options.signal.addEventListener('abort', () => reject(Error('private-network-detail')), { once: true }))
  const timeout = new prototype.KeyCache({ time: clock(), fetcher: hang, timeoutMs: 20 })
  await assert.rejects(timeout.get(signal()), { code: 'TIMEOUT', message: 'TIMEOUT' })
  let release, gets = 0
  const cache = new prototype.KeyCache({ time: clock(), fetcher: async () => { gets++; return new Promise(resolve => { release = () => resolve(response()) }) } })
  const controller = new AbortController()
  const one = cache.get(controller.signal), two = cache.get(signal())
  const rejected = assert.rejects(one, { code: 'CANCELLED', message: 'CANCELLED' })
  controller.abort(); await rejected; release()
  assert.equal((await two).provenance, 'transport-200'); assert.equal(gets, 1)
  assert.equal((await cache.get(signal())).provenance, 'memory-fresh')
  return { cancelledWaiters: 1, successfulWaiters: 1, gets, timeoutMs: 20 }
})

scenario('M4.3', 'last caller cancellation cancels transport; force control cannot join ordinary cache work', async () => {
  let gets = 0, aborts = 0
  const controllers = []
  const cache = new prototype.KeyCache({ time: clock(), fetcher: (_url, options) => {
    gets++; return new Promise((resolve, reject) => { controllers.push(() => resolve(response())); options.signal.addEventListener('abort', () => { aborts++; reject(fail('CANCELLED')) }, { once: true }) })
  } })
  const controller = new AbortController(), first = cache.get(controller.signal)
  const rejected = assert.rejects(first, { code: 'CANCELLED' }); controller.abort(); await rejected
  assert.equal(aborts, 1)
  const ordinary = cache.get(signal()), control = cache.get(signal(), { force: true })
  assert.equal(gets, 3); controllers[1](); controllers[2](); await Promise.all([ordinary, control])
  return { gets, aborts, forcedControlOwnRequest: true }
})

scenario('M5.1', 'JWKS unavailable prevents POST; response lost after POST remains uncertain and never retries', async () => {
  for (const afterPost of [false, true]) {
    let gets = 0, posts = 0
    const stored = previous(), before = structuredClone(stored)
    const transport = async (_url, request) => {
      if (request.method === 'GET') { gets++; if (!afterPost) throw fail('NETWORK_UNAVAILABLE'); return keys }
      posts++; throw fail('NETWORK_UNAVAILABLE')
    }
    await assert.rejects(refreshCredentials(stored, { signal: signal(), transport }), { code: 'NETWORK_UNAVAILABLE' })
    assert.equal(posts, afterPost ? 1 : 0); assert.equal(gets, 1); assert.deepEqual(stored, before)
    output.cases.push({ id: afterPost ? 'M5.1.after' : 'M5.1.before', status: 'passed', gets, posts, outcome: afterPost ? 'post-result-unknown-no-automatic-replay' : 'post-not-started' })
  }
  return { automaticReplay: false }
})

scenario('M5.2', 'new signing key after rotation is received-unvalidated in shipped flow; candidate can recover keys only', async () => {
  const rotatedResponse = await tokenResponse({ id_token: await signed({}, rotated.privateKey, keyB.kid) })
  let gets = 0, posts = 0
  await assert.rejects(refreshCredentials(previous(), { signal: signal(), transport: async (_url, request) => {
    if (request.method === 'GET') { gets++; return keys }
    posts++; return rotatedResponse
  } }), { code: 'OAUTH_INVALID' })
  assert.deepEqual({ gets, posts }, { gets: 1, posts: 1 })
  const baseline = { gets, posts, outcome: 'rotation-response-received-unvalidated-not-saved' }
  gets = 0; posts = 0
  const cache = new prototype.KeyCache({ time: clock(), fetcher: async () => { gets++; return response(posts ? { keys: [keyB] } : keys) } })
  const next = await refreshCandidate(previous(), cache, { signal: signal(), transport: async (_url, request) => {
    assert.equal(request.method, 'POST'); posts++; return rotatedResponse
  } })
  assert.equal(next.refreshToken, 'synthetic-next-refresh'); assert.deepEqual({ gets, posts }, { gets: 2, posts: 1 })
  return { baseline, candidate: { gets, posts, outcome: 'identity-validated-after-key-only-recovery' }, crashBeforeSave: 'response-not-retained-explicit-gap' }
})

scenario('M5.3', 'absent or expired keys prevent POST; rotation failures never write the fake vault or probe', async () => {
  const rows = []
  for (const mode of ['absent-cache-blocked', 'expired-cache-blocked', 'lost-response', 'new-kid-blocked', 'missing-scopes']) {
    let stored = previous(), writes = 0, posts = 0, gets = 0, probes = 0
    const before = structuredClone(stored)
    const time = clock()
    let blocked = mode === 'absent-cache-blocked'
    const cache = new prototype.KeyCache({ time, fetcher: async () => { gets++; if (blocked || gets > 1) throw fail('NETWORK_UNAVAILABLE'); return response() } })
    if (mode === 'expired-cache-blocked') { await cache.get(signal()); time.advance(300_000); blocked = true }
    const connection = new CodexConnection({
      vault: { read: async () => structuredClone(stored), write: async value => { writes++; stored = structuredClone(value) }, clear: async () => { throw Error('FORBIDDEN_CLEAR') } },
      oauth: async () => { throw Error('FORBIDDEN_OAUTH') },
      refresh: (value, abort) => refreshCandidate(value, cache, { signal: abort, transport: async (_url, request) => {
        assert.equal(request.method, 'POST'); posts++
        if (mode === 'lost-response') throw fail('NETWORK_UNAVAILABLE')
        return tokenResponse(mode === 'missing-scopes' ? { scope: 'openid' } : { id_token: await signed({}, rotated.privateKey, keyB.kid) })
      } }), probe: async () => { probes++; throw Error('FORBIDDEN_PROBE') }, now: () => new Date(),
      openUsage: async () => {}, openPublicKeys: async () => {}, copyPublicKeys: async () => {}
    })
    await assert.rejects(connection.acquireDialogue(signal()))
    const expectedPosts = mode.endsWith('cache-blocked') ? 0 : 1
    assert.equal(posts, expectedPosts, mode + ' must check keys before sending a POST'); assert.equal(writes, 0); assert.equal(probes, 0); assert.deepEqual(stored, before)
    assert.equal(gets, mode === 'expired-cache-blocked' || mode === 'new-kid-blocked' ? 2 : 1)
    assert.equal((await connection.read()).accountStored, true)
    await connection.shutdown(); assert.equal(posts, expectedPosts)
    rows.push({ mode, gets, posts, writes, probes, state: !expectedPosts ? 'post-not-started' : mode === 'lost-response' ? 'unknown-post-result' : 'received-unvalidated' })
  }
  return { rows, crashRetention: 'not-implemented-in-shipped-flow' }
})

scenario('M6.1', 'fresh keys cannot satisfy explicit blocked control; recovery preserves waiting and local draft', async () => {
  const time = clock(); let blocked = false, gets = 0, refreshes = 0, probes = 0, oauth = 0
  const cache = new prototype.KeyCache({ time, fetcher: async () => { gets++; if (blocked) return new Response('', { status: 307 }); return response() } })
  await cache.get(signal()); blocked = true
  const stored = { ...previous(), expiresAt: Date.now() + 3_600_000 }
  const vault = { read: async () => structuredClone(stored), write: async () => { throw Error('FORBIDDEN_WRITE') } }
  const deps = { vault, oauth: async () => { oauth++; throw Error('FORBIDDEN_OAUTH') }, refresh: async () => { refreshes++; throw Error('FORBIDDEN_REFRESH') }, probe: async () => { probes++; throw Error('FORBIDDEN_PROBE') }, now: () => new Date(), openUsage: async () => {}, openPublicKeys: async () => {}, copyPublicKeys: async () => {}, checkPublicKeys: abort => cache.get(abort, { force: true }).then(() => {}) }
  const connection = new CodexConnection(deps)
  await connection.read()
  const lease = await connection.acquireDialogue(signal()); lease.release(false)
  const local = { ...emptySnapshot(), projects: [{ id: 'fixture-project', name: 'Fixture', rootPath: 'C:/synthetic-fixture', openedAt: '2026-10-28T00:00:00.000Z' }], activeProjectId: 'fixture-project', drafts: [{ projectId: 'fixture-project', text: 'Brouillon local conservé', savedAt: '2026-10-28T00:00:00.000Z' }] }
  let disk = structuredClone(local)
  const app = new Application({ store: { read: async () => structuredClone(disk), write: async value => { disk = structuredClone(value) } }, chooseDirectory: async () => null, newId: () => 'fixture-id', now: () => '2026-10-28T00:00:00.000Z' })
  const request = { contractVersion: 1, correlationId: 'fixture-read', type: 'read-state' }
  const before = await app.execute(request)
  assert.equal(isSnapshot(local), true, 'fixture must satisfy the real snapshot contract')
  assert.equal(before.ok, true); assert.equal(isReply(before), true)
  assert.equal(before.value.state.drafts[0].text, 'Brouillon local conservé')
  async function settle() { for (let i = 0; i < 100; i++) { const state = await connection.read(); if (state.network.status !== 'checking') return state; await new Promise(resolve => setTimeout(resolve, 1)) } throw Error('CONTROL_DID_NOT_SETTLE') }
  await connection.command('check-public-keys'); let state = await settle()
  assert.equal(state.network.status, 'error'); assert.equal(state.status, 'unknown'); assert.equal(state.errorCode, 'STOP_UNCONFIRMED'); assert.equal(gets, 2)
  assert.equal((await cache.get(signal())).provenance, 'memory-fresh')
  blocked = false; await connection.command('check-public-keys'); state = await settle()
  assert.equal(state.network.status, 'accessible'); assert.equal(state.status, 'unknown'); assert.equal(state.verifiedAt, null)
  await assert.rejects(connection.acquireDialogue(signal()), { code: 'STOP_UNCONFIRMED' })
  assert.deepEqual(await app.execute(request), before); assert.equal(gets, 3)
  await app.shutdown(); await connection.shutdown()
  const reopenedApp = new Application({ store: { read: async () => structuredClone(disk) }, chooseDirectory: async () => null, newId: () => 'fixture-id', now: () => '' })
  assert.deepEqual(await reopenedApp.execute(request), before); await reopenedApp.shutdown()
  const reopenedConnection = new CodexConnection({ ...deps, recovery: { status: async () => 'unknown' } })
  const restored = await reopenedConnection.read(); assert.equal(restored.status, 'unknown'); assert.equal(restored.verifiedAt, null)
  assert.deepEqual({ oauth, refreshes, probes }, { oauth: 0, refreshes: 0, probes: 0 }); await reopenedConnection.shutdown()
  return { gets, oauth, refreshes, probes, localDraftReadExact: true, restoredWaiting: 'unknown-stop-unconfirmed', humanClickSimulated: false }
})
