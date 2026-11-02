import { createHash } from 'node:crypto'
import { lstat, readFile, readdir, realpath } from 'node:fs/promises'
import { isAbsolute, join, relative, resolve, sep } from 'node:path'
import { dialogueFailure } from '../../contracts/dialogue.ts'
const runtimeFingerprint = 'eaffa289643c1f9f91e7f32a23d06025988ee7e2b7efc0a12298a0997e626e40'
// La politique historique omet les .pem : ce réglage TLS est vérifié séparément.
const rejectedCaFingerprint = 'c916ce1b14ed8ca69e9b5c9fab22799a900dd610d6d4ec9b1347f4fd48e53718'
const uvFingerprint = '2bfbe53d3cc95799e98fa08323b04844fc01d4f8c87dd5c00089e43f6554f162'
export async function verifyRuntimeFile(path: string, expected: string): Promise<void> { if (!(await lstat(path)).isFile() || createHash('sha256').update(await readFile(path)).digest('hex') !== expected) throw dialogueFailure('RESOLVER_FAILED') }
export async function runtimeTreeFingerprint(root: string): Promise<string> {
  const digest = createHash('sha256')
  const visit = async (path: string, relative: string): Promise<void> => {
    const info = await lstat(path); if (info.isSymbolicLink()) throw dialogueFailure('RESOLVER_FAILED')
    if (info.isDirectory()) { for (const name of (await readdir(path)).sort()) { if (['site-packages', '__pycache__', 'test', 'tests'].includes(name)) continue; await visit(join(path, name), relative ? relative + '/' + name : name) } }
    else if (info.isFile() && /\.(py|exe|dll|pyd|zip|pth)$/i.test(path)) digest.update(relative + ':' + createHash('sha256').update(await readFile(path)).digest('hex') + '\n')
  }
  for (const name of ['python.exe', 'python3.dll', 'python312.dll', 'vcruntime140.dll', 'vcruntime140_1.dll', 'DLLs', 'Lib']) await visit(join(root, name), name)
  return digest.digest('hex')
}
/** Le projet sélectionné ne fournit aucun exécutable ni module Python. -E -s -S excluent site et PYTHON*. */
export async function bmadRuntime(projectRoot?: string): Promise<{ uv: string; python: string }> {
  const user = process.env.USERPROFILE
  if (!user || !isAbsolute(user)) throw dialogueFailure('RESOLVER_FAILED')
  const root = await realpath(join(user, '.cache/codex-runtimes/codex-primary-runtime/dependencies/python'))
  const uv = await realpath(join(user, 'scoop/apps/uv/current/uv.exe'))
  if (projectRoot) for (const path of [root, uv]) { const distance = relative(resolve(projectRoot), path); if (!distance || !isAbsolute(distance) && distance !== '..' && !distance.startsWith('..' + sep)) throw dialogueFailure('RESOLVER_FAILED') }
  await verifyRuntimeFile(uv, uvFingerprint)
  try { await verifyRuntimeFile(join(root, 'Lib/codex-rejected-cas.pem'), rejectedCaFingerprint) } catch { throw dialogueFailure('RESOLVER_FAILED') }
  if (await runtimeTreeFingerprint(root) !== runtimeFingerprint) throw dialogueFailure('RESOLVER_FAILED')
  return { uv, python: join(root, 'python.exe') }
}
