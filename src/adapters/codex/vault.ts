import { mkdir, lstat, open, readFile, rename, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID, createHash } from 'node:crypto'
import { connectionFailure } from '../../contracts/connection.ts'
import { isRecord } from '../../contracts/index.ts'
export type Registration = { version: 1; hostId: string; clientId: string | null }
export type Credentials = { version: 1; clientId: string; subject: string; accessToken: string; refreshToken: string; idToken: string; expiresAt: number; scopes: string[]; planAcknowledged: boolean }
export interface VaultPort { read(): Promise<Credentials | null>; write(value: Credentials): Promise<void>; clear(): Promise<void>; registration(): Promise<Registration>; saveClientId(clientId: string): Promise<void> }
export interface Encryption { isEncryptionAvailable(): boolean; encryptString(value: string): Buffer; decryptString(value: Buffer): string }
const client = (value: unknown): value is string => typeof value === 'string' && /^oaiapp_[a-zA-Z0-9_-]{1,160}$/.test(value)
export const isIssuedClientId = client
const secret = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value.length <= 32768 && !/[\u0000-\u0020\u007f]/.test(value)
export function isCredentials(value: unknown): value is Credentials {
  return isRecord(value) && Object.keys(value).sort().join(',') === 'accessToken,clientId,expiresAt,idToken,planAcknowledged,refreshToken,scopes,subject,version' && value.version === 1 && client(value.clientId) && secret(value.subject) && secret(value.accessToken) && secret(value.refreshToken) && secret(value.idToken) && Number.isSafeInteger(value.expiresAt) && Number(value.expiresAt) > 0 && typeof value.planAcknowledged === 'boolean' && Array.isArray(value.scopes) && value.scopes.length <= 30 && value.scopes.every((scope) => typeof scope === 'string' && /^[a-zA-Z0-9._:-]{1,100}$/.test(scope))
}
const digest = (bytes: Buffer): string => createHash('sha256').update(bytes).digest('hex')
async function boundedRead(path: string): Promise<Buffer | null> {
  try {
    const info = await lstat(path)
    if (!info.isFile() || info.isSymbolicLink() || info.size > 262144) throw connectionFailure('VAULT_UNREADABLE')
    const bytes = await readFile(path)
    if (bytes.length > 262144) throw connectionFailure('VAULT_UNREADABLE')
    return bytes
  } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null; throw connectionFailure('VAULT_UNREADABLE') }
}
async function atomic(path: string, bytes: Buffer): Promise<void> {
  const temporary = path + '.' + randomUUID() + '.tmp'
  try {
    const file = await open(temporary, 'wx', 0o600)
    try { await file.writeFile(bytes); await file.sync() } finally { await file.close() }
    await rename(temporary, path)
  } finally { await unlink(temporary).catch(() => {}) }
}
/** safeStorage est injecté depuis Main ; le coffre reste indépendant d’Electron. */
export class CodexVault implements VaultPort {
  private expected: string | null | undefined
  private blocked = false
  private root: string
  private encryption: Encryption
  constructor(root: string, encryption: Encryption) { this.root = root; this.encryption = encryption }
  private requireEncryption(): void { if (!this.encryption.isEncryptionAvailable()) throw connectionFailure('ENCRYPTION_UNAVAILABLE') }
  async read(): Promise<Credentials | null> {
    this.requireEncryption()
    try {
      const bytes = await boundedRead(join(this.root, 'credentials.bin'))
      if (bytes === null) { this.expected = null; this.blocked = false; return null }
      const value: unknown = JSON.parse(this.encryption.decryptString(bytes))
      if (!isCredentials(value)) throw connectionFailure('VAULT_UNREADABLE')
      this.expected = digest(bytes); this.blocked = false
      return value
    } catch { this.blocked = true; throw connectionFailure('VAULT_UNREADABLE') }
  }
  async write(value: Credentials): Promise<void> {
    this.requireEncryption()
    if (this.blocked || !isCredentials(value)) throw connectionFailure('VAULT_UNREADABLE')
    if (this.expected === undefined) await this.read()
    const current = await boundedRead(join(this.root, 'credentials.bin'))
    if ((current === null ? null : digest(current)) !== this.expected) throw connectionFailure('VAULT_UNREADABLE')
    try {
      await mkdir(this.root, { recursive: true })
      const bytes = this.encryption.encryptString(JSON.stringify(value))
      await atomic(join(this.root, 'credentials.bin'), bytes)
      this.expected = digest(bytes)
    } catch { throw connectionFailure('VAULT_WRITE_FAILED') }
  }
  async clear(): Promise<void> {
    try {
      await boundedRead(join(this.root, 'credentials.bin'))
      await unlink(join(this.root, 'credentials.bin')).catch((error: NodeJS.ErrnoException) => { if (error.code !== 'ENOENT') throw error })
      this.expected = null; this.blocked = false
    } catch { throw connectionFailure('VAULT_WRITE_FAILED') }
  }
  async registration(): Promise<Registration> {
    try {
      const bytes = await boundedRead(join(this.root, 'registration.json'))
      if (bytes) {
        const value: unknown = JSON.parse(bytes.toString('utf8'))
        if (!isRecord(value) || Object.keys(value).sort().join(',') !== 'clientId,hostId,version' || value.version !== 1 || typeof value.hostId !== 'string' || !/^urn:uuid:[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(value.hostId) || value.clientId !== null && !client(value.clientId)) throw connectionFailure('REGISTRATION_INVALID')
        return value as Registration
      }
      const value: Registration = { version: 1, hostId: 'urn:uuid:' + randomUUID(), clientId: null }
      await mkdir(this.root, { recursive: true }); await atomic(join(this.root, 'registration.json'), Buffer.from(JSON.stringify(value)))
      return value
    } catch { throw connectionFailure('REGISTRATION_INVALID') }
  }
  async saveClientId(clientId: string): Promise<void> {
    if (!client(clientId)) throw connectionFailure('REGISTRATION_INVALID')
    const registration = await this.registration()
    if (registration.clientId !== null && registration.clientId !== clientId) throw connectionFailure('REGISTRATION_INVALID')
    try { await atomic(join(this.root, 'registration.json'), Buffer.from(JSON.stringify({ ...registration, clientId }))) }
    catch { throw connectionFailure('REGISTRATION_INVALID') }
  }
}
