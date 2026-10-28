// Research prototype only. Nothing under src/ imports this module.
// Dependencies are ports: no default fetch, filesystem, credentials or personal profile.
import { createLocalJWKSet, importJWK } from 'jose'
import { validateIdentity } from '../../../src/adapters/codex/oauth.ts'

export const URL_KEYS = 'https://auth.openai.com/.well-known/jwks.json'
const failure = code => Object.assign(Error(code), { code })
const clone = value => structuredClone(value)

async function rsaKeys(value) {
  try {
    if (!value || !Array.isArray(value.keys) || !value.keys.length || value.keys.length > 30) throw Error()
    const signing = value.keys.filter(key => key && key.kty === 'RSA' && (key.alg === undefined || key.alg === 'RS256') && (key.use === undefined || key.use === 'sig') && (key.key_ops === undefined || Array.isArray(key.key_ops) && key.key_ops.includes('verify')))
    if (!signing.length || value.keys.some(key => !key || typeof key !== 'object' || 'd' in key || 'k' in key)) throw Error()
    for (const key of signing) {
      const imported = await importJWK(key, 'RS256')
      if (imported instanceof Uint8Array || imported.type !== 'public' || !('modulusLength' in imported.algorithm) || imported.algorithm.modulusLength < 2048) throw Error()
    }
    createLocalJWKSet(value)
    return clone(value)
  } catch { throw failure('OAUTH_INVALID') }
}

// A conservative subset, deliberately not a general HTTP cache implementation.
// Missing/invalid/duplicate max-age never earns heuristic freshness. Date/Age and
// request duration consume the explicit server lifetime, capped by candidate risk policy.
function freshness(headers, started, received, capMs) {
  const directives = (headers.get('cache-control') ?? '').split(',').map(s => s.trim().toLowerCase())
  const noStore = directives.some(s => /^no-store(?:\s*=|$)/.test(s))
  const noCache = directives.some(s => /^no-cache(?:\s*=|$)/.test(s))
  const ages = directives.filter(s => /^max-age(?:\s*=|$)/.test(s))
  const parsed = ages.length === 1 && /^max-age\s*=\s*\d+$/.test(ages[0]) ? Number(ages[0].split('=')[1]) : NaN
  const ageText = headers.get('age')
  const age = ageText === null ? 0 : /^\d+$/.test(ageText) ? Number(ageText) * 1000 : NaN
  const dateText = headers.get('date'), date = dateText === null ? received.wall : Date.parse(dateText)
  const valid = Number.isSafeInteger(parsed) && Number.isSafeInteger(age) && Number.isFinite(date) && received.wall >= started.wall && received.mono >= started.mono
  const delay = Math.max(received.wall - started.wall, received.mono - started.mono)
  const initialAge = valid ? Math.max(0, received.wall - date, age + delay) : Infinity
  const remainingMs = noStore || noCache || !valid ? 0 : Math.max(0, Math.min(capMs, parsed * 1000) - initialAge)
  return { noStore, noCache, remainingMs }
}

function until(promise, signal) {
  if (signal.aborted) return Promise.reject(signal.reason ?? failure('CANCELLED'))
  let abort
  return Promise.race([promise, new Promise((_, reject) => {
    abort = () => reject(signal.reason ?? failure('CANCELLED')); signal.addEventListener('abort', abort, { once: true })
  })]).finally(() => signal.removeEventListener('abort', abort))
}

export class KeyCache {
  #record = null
  #pending = null
  #issued = 0
  #applied = 0
  #unknownAt = -Infinity
  #lastObserved = null
  constructor({ fetcher, time, strategy = 'memory', storage = {}, capMs = 300_000, timeoutMs = 15_000 }) {
    if (typeof fetcher !== 'function' || !time || !Number.isFinite(capMs) || capMs < 0 || capMs > 600_000 || !Number.isFinite(timeoutMs) || timeoutMs <= 0 || timeoutMs > 15_000 || !['none', 'memory', 'persistent-untrusted', 'revalidate'].includes(strategy)) throw Error('INVALID_PROTOTYPE_OPTIONS')
    this.fetcher = fetcher; this.time = time; this.strategy = strategy; this.storage = storage; this.capMs = capMs; this.timeoutMs = timeoutMs
    // A plain digest, file ACL assumption, future timestamp or valid RSA syntax
    // cannot establish who supplied persistent keys. This option is disqualified.
    this.restored = storage.record === undefined ? 'absent' : 'untrusted-discarded'
  }
  #now() {
    const now = { wall: this.time.wall, mono: this.time.mono }
    if (!Number.isFinite(now.wall) || !Number.isFinite(now.mono) || this.#lastObserved && (now.wall < this.#lastObserved.wall || now.mono < this.#lastObserved.mono)) this.#record = null
    this.#lastObserved = now
    return now
  }
  #fresh() {
    const now = this.#now(), record = this.#record
    return !!record && Number.isFinite(now.wall) && Number.isFinite(now.mono) && now.wall >= record.wall && now.mono >= record.mono && now.wall < record.wall + record.remainingMs && now.mono < record.mono + record.remainingMs
  }
  describe() { return { fresh: this.#fresh(), restored: this.restored, strategy: this.strategy, trust: 'current-process-transport-only' } }
  get(signal, { force = false } = {}) {
    if (signal.aborted) return Promise.reject(failure('CANCELLED'))
    if (!force && this.strategy !== 'none' && this.strategy !== 'revalidate' && this.#fresh()) {
      const record = this.#record
      return Promise.resolve({ jwks: clone(record.jwks), provenance: 'memory-fresh', remainingMs: Math.max(0, Math.min(record.wall + record.remainingMs - this.time.wall, record.mono + record.remainingMs - this.time.mono)) })
    }
    let job = !force && this.#pending
    if (!job || job.controller.signal.aborted) {
      job = { controller: new AbortController(), waiters: 0, done: false }
      const sequence = ++this.#issued
      job.promise = this.#load(job.controller, sequence, force).finally(() => { job.done = true; if (this.#pending === job) this.#pending = null })
      if (!force) this.#pending = job
    }
    job.waiters++
    // Caller cancellation detaches that caller only. The final caller owns abort.
    return until(job.promise, signal).catch(error => { throw signal.aborted ? failure('CANCELLED') : error }).finally(() => {
      job.waiters--
      if (!job.waiters && !job.done) { job.controller.abort(failure('CANCELLED')); if (this.#pending === job) this.#pending = null }
    }).then(clone)
  }
  async #load(controller, sequence, force) {
    const started = this.#now(), prior = this.#record
    const headers = { Accept: 'application/json' }
    if (!force && this.strategy === 'revalidate' && prior?.etag) headers['If-None-Match'] = prior.etag
    const timer = setTimeout(() => controller.abort(failure('TIMEOUT')), this.timeoutMs)
    let reader, response
    try {
      response = await until(Promise.resolve(this.fetcher(URL_KEYS, { method: 'GET', headers, signal: controller.signal, redirect: 'error', credentials: 'omit', cache: 'no-store' })), controller.signal)
      let jwks, policyHeaders = new Headers(response.headers), provenance
      if (response.status === 304) {
        if (!headers['If-None-Match'] || !prior || policyHeaders.has('etag') && policyHeaders.get('etag') !== prior.etag) throw failure('NETWORK_UNAVAILABLE')
        const merged = new Headers(prior.headers)
        for (const [name, value] of policyHeaders) merged.set(name, value)
        // If the validation did not supply Date/Age, do not carry old Age as new evidence.
        if (!policyHeaders.has('date')) merged.delete('date')
        if (!policyHeaders.has('age')) merged.delete('age')
        policyHeaders = merged; jwks = await rsaKeys(prior.jwks); provenance = 'transport-304'
      } else {
        if (response.status !== 200 || !response.body || Number(response.headers.get('content-length') ?? 0) > 262144) throw failure('NETWORK_UNAVAILABLE')
        reader = response.body.getReader()
        const chunks = []; let bytes = 0
        for (;;) {
          const { value, done } = await until(reader.read(), controller.signal)
          if (done) break
          bytes += value.byteLength
          if (bytes > 262144) throw failure('NETWORK_UNAVAILABLE')
          chunks.push(value)
        }
        let json
        try { json = JSON.parse(Buffer.concat(chunks).toString('utf8')) } catch { throw failure('NETWORK_UNAVAILABLE') }
        jwks = await rsaKeys(json); provenance = 'transport-200'
      }
      controller.signal.throwIfAborted()
      const received = this.#now(), policy = freshness(policyHeaders, started, received, this.capMs)
      const record = { jwks, wall: received.wall, mono: received.mono, remainingMs: policy.remainingMs, etag: policyHeaders.get('etag'), headers: Object.fromEntries(policyHeaders) }
      if (sequence >= this.#applied) {
        this.#applied = sequence
        this.#record = policy.noStore || this.strategy === 'none' ? null : record
        if (this.strategy === 'persistent-untrusted') {
          if (policy.noStore) delete this.storage.record
          else this.storage.record = JSON.stringify({ url: URL_KEYS, ...record })
        }
      }
      return { jwks: clone(jwks), provenance, remainingMs: policy.remainingMs }
    } catch (error) {
      if (controller.signal.aborted) throw failure(controller.signal.reason?.code === 'TIMEOUT' ? 'TIMEOUT' : 'CANCELLED')
      throw failure(error?.code === 'OAUTH_INVALID' ? 'OAUTH_INVALID' : 'NETWORK_UNAVAILABLE')
    } finally {
      clearTimeout(timer)
      if (reader) { await reader.cancel().catch(() => {}); reader.releaseLock() }
      else await response?.body?.cancel().catch(() => {})
    }
  }
  resolver(signal) {
    let retried = false
    return async (header, token) => {
      const current = await this.get(signal)
      try { return await createLocalJWKSet(current.jwks)(header, token) }
      catch (error) {
        const now = this.time.mono
        if (error.code !== 'ERR_JWKS_NO_MATCHING_KEY' || retried || now < this.#unknownAt || now - this.#unknownAt < 30_000) throw error
        retried = true; this.#unknownAt = now
        const fresh = await this.get(signal, { force: true })
        return createLocalJWKSet(fresh.jwks)(header, token)
      }
    }
  }
  identity(token, options, signal) { return validateIdentity(token, { ...options, jwks: this.resolver(signal) }) }
}
