import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto'
const module = await import('../src/adapters/codex/vault.ts').catch(() => null)
const value = { version: 1, clientId: 'oaiapp_testclient', subject: 'subject', accessToken: 'access-private', refreshToken: 'refresh-private', idToken: 'id-private', expiresAt: Date.now() + 600000, scopes: ['openid', 'profile', 'email', 'offline_access', 'resource.invoke', 'chatgpt.tokens.use.direct'], planAcknowledged: false }
// Un substitut cryptographique isolé teste la persistance ; DPAPI est vérifié séparément dans Electron.
function cipher() { const key = randomBytes(32); return { isEncryptionAvailable: () => true, encryptString: (text) => { const nonce = randomBytes(12), c = createCipheriv('aes-256-gcm', key, nonce); const body = Buffer.concat([c.update(text, 'utf8'), c.final()]); return Buffer.concat([nonce, c.getAuthTag(), body]) }, decryptString: (data) => { if (data.length < 28) throw Error('ciphertext invalid'); const c = createDecipheriv('aes-256-gcm', key, data.subarray(0, 12)); c.setAuthTag(data.subarray(12, 28)); return Buffer.concat([c.update(data.subarray(28)), c.final()]).toString('utf8') } } }
test('le coffre chiffre atomiquement, restaure et conserve l’inscription après déconnexion', async () => {
  assert.ok(module, 'Le coffre doit exister')
  const root = await mkdtemp(join(tmpdir(), 'madness-vault-'))
  try {
    const crypto = cipher(), vault = new module.CodexVault(root, crypto)
    assert.equal(await vault.read(), null)
    const reg = await vault.registration(); assert.match(reg.hostId, /^urn:uuid:/)
    await vault.saveClientId('oaiapp_testclient'); await vault.write(value)
    assert.equal((await readFile(join(root, 'credentials.bin'))).includes(Buffer.from('private')), false)
    assert.deepEqual(await new module.CodexVault(root, crypto).read(), value)
    await vault.clear(); assert.equal(await vault.read(), null)
    assert.deepEqual(await vault.registration(), { ...reg, clientId: 'oaiapp_testclient' })
  } finally { await rm(root, { recursive: true, force: true }) }
})
test('chiffrement absent et coffre corrompu préservent les octets sans fallback clair', async () => {
  assert.ok(module)
  const root = await mkdtemp(join(tmpdir(), 'madness-vault-'))
  try {
    const path = join(root, 'credentials.bin'); await writeFile(path, 'corrupt-original')
    await assert.rejects(new module.CodexVault(root, { isEncryptionAvailable: () => false }).read(), { code: 'ENCRYPTION_UNAVAILABLE' })
    const vault = new module.CodexVault(root, cipher())
    await assert.rejects(vault.read(), { code: 'VAULT_UNREADABLE' })
    await assert.rejects(vault.write(value), { code: 'VAULT_UNREADABLE' })
    assert.equal(await readFile(path, 'utf8'), 'corrupt-original')
  } finally { await rm(root, { recursive: true, force: true }) }
})
