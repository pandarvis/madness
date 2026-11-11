import { createHash } from 'node:crypto'
import { spawn } from 'node:child_process'
import { lstat, readFile, realpath } from 'node:fs/promises'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { tmpdir } from 'node:os'
import { dialogueFailure } from '../../contracts/dialogue.ts'
import { isRecord } from '../../contracts/index.ts'
import type { BmadProfile } from '../../core/ports.ts'
import { stopNative } from '../codex/probe.ts'
import { bmadRuntime } from './runtime.ts'
import { removeManagedBlock } from '../kits/overrides.ts'
/** Profil pilote figé de l’installation du 24 octobre. Toute mise à jour demande une requalification. */
const fingerprints: Record<string, string> = {
  '.agents/skills/bmad-agent-analyst/SKILL.md': '6484b18e36a2c5c40bfdaa3c820b7251dad20b97624dd7d43cc629cd33d61e2a',
  '.agents/skills/bmad-agent-analyst/customize.toml': 'eaed9efbff9cc115b83d5d263b19b9e0202b5b30fa9c4321d18f8c401cbfe85e',
  '.agents/skills/bmad-agent-analyst/bmod.toml': 'ec2117eafcb40f25457ff4667750e0e98824b4255ca83f3af8d4f8724b851f6c',
  '_bmad/scripts/resolve_customization.py': 'ba379892dea849bdf2bbf7183556dc1030a8aa775ff083d3b89db47b18bf367f',
  '_bmad/scripts/resolve_config.py': 'de612645d546001e1dd3f5af69de6559afe4733bbb54ea40429715e94324a762',
  '_bmad/scripts/config_utils.py': '989410c4009b908121bbb0fe551a2d7db29f89385d0688cda5cbfc162a5511a1',
  '_bmad/scripts/setup_check.py': '1c59560aba5f3daed3ab64a04bfb15e0f88a2982f63cd541725ac46a4eca033f',
  '_bmad/scripts/setup.py': '1de76dce0b4ba702da927d6dc83fd620ec0774aa1c1ab0cc5739167c135f64f8'
}
export const PROFILE_FILES = Object.keys(fingerprints)
const optionalLayers = ['_bmad/custom/bmad-agent-analyst.toml', '_bmad/custom/bmad-agent-analyst.user.toml']
const configLayers = ['_bmad/custom/config.toml', '_bmad/custom/config.user.toml']
const hash = (value: Buffer | string): string => createHash('sha256').update(value).digest('hex')
async function trustedFile(root: string, path: string, limit = 262144): Promise<Buffer> {
  const absolute = resolve(root, path), distance = relative(root, absolute)
  if (!distance || isAbsolute(distance) || distance === '..' || distance.startsWith('..' + sep)) throw dialogueFailure('PROFILE_UNRECOGNIZED')
  let parent = absolute
  while (parent !== root) { const info = await lstat(parent); if (info.isSymbolicLink()) throw dialogueFailure('PROFILE_UNRECOGNIZED'); parent = dirname(parent) }
  if ((await realpath(absolute)).toLowerCase() !== absolute.toLowerCase()) throw dialogueFailure('PROFILE_UNRECOGNIZED')
  const info = await lstat(absolute)
  if (!info.isFile() || info.size > limit) throw dialogueFailure('PROFILE_UNRECOGNIZED')
  return readFile(absolute)
}
/** A Mary override Madness wrote for the project's kits: nothing else in it but comments and blank lines. */
export function onlyMadnessBlock(text: string): boolean {
  if (!text.includes('# madness:kits:begin')) return false
  try { return removeManagedBlock(text).split(/\r?\n/).every(line => !line.trim() || line.trim().startsWith('#')) } catch { return false }
}

export async function qualifyBmadProfile(rootPath: string): Promise<BmadProfile> {
  let root: string
  try { root = await realpath(rootPath) } catch { throw dialogueFailure('PROFILE_ABSENT') }
  const hashes: string[] = [];let skillBytes=0
  try {
    for (const path of PROFILE_FILES) { const captured=await trustedFile(root,path);if(path==='.agents/skills/bmad-agent-analyst/SKILL.md')skillBytes=captured.length;const actual = hash(captured); if (actual !== fingerprints[path]) throw dialogueFailure('PROFILE_CHANGED'); hashes.push(path + ':' + actual) }
    // Hand-written Mary overrides stay refused; the one Madness writes for kits is accepted and fingerprinted.
    for (const layer of optionalLayers) {
      let content: Buffer | null = null
      try { content = await trustedFile(root, layer, 262144) } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
      if (!content) continue
      if (!onlyMadnessBlock(content.toString('utf8'))) throw dialogueFailure('PROFILE_UNRECOGNIZED')
      hashes.push(layer + ':' + hash(content))
    }
    const config = await trustedFile(root, '_bmad/config.toml', 32768)
    hashes.push('_bmad/config.toml:' + hash(config))
    for (const layer of configLayers) { try { hashes.push(layer + ':' + hash(await trustedFile(root, layer, 32768))) } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; hashes.push(layer + ':absent') } }
  } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw dialogueFailure('PROFILE_ABSENT'); throw error }
  return { rootPath: root, skillPath: join(root, '.agents/skills/bmad-agent-analyst/SKILL.md'), fingerprint: hash(hashes.join('\n')),catalogSource:{path:join(root,'.agents/skills/bmad-agent-analyst/SKILL.md'),sha256:fingerprints['.agents/skills/bmad-agent-analyst/SKILL.md'],bytes:skillBytes} }
}
export async function assertBmadProfile(profile: BmadProfile): Promise<void> { if ((await qualifyBmadProfile(profile.rootPath)).fingerprint !== profile.fingerprint) throw dialogueFailure('PROFILE_CHANGED') }
export async function readBmadFile(profile: BmadProfile, path: string): Promise<string> {
  await assertBmadProfile(profile)
  const relativePath = relative(profile.rootPath, isAbsolute(path) ? path : resolve(profile.rootPath, path)).replaceAll('\\', '/')
  if (![...PROFILE_FILES, '_bmad/config.toml', ...configLayers].includes(relativePath)) throw dialogueFailure('UNSUPPORTED_INTERACTION')
  return (await trustedFile(profile.rootPath, relativePath)).toString('utf8')
}
/** Aucun shell et aucune commande fournie par le modèle : seulement les deux entrées BMad vérifiées. */
export async function resolveBmad(profile: BmadProfile, kind: 'agent' | 'config', signal: AbortSignal): Promise<string> {
  await assertBmadProfile(profile); signal.throwIfAborted()
  const { uv, python } = await bmadRuntime()
  signal.throwIfAborted()
  const script = join(profile.rootPath, '_bmad/scripts', kind === 'agent' ? 'resolve_customization.py' : 'resolve_config.py')
  // -I retire cwd et script-dir de sys.path. Charger uniquement les trois dépendances épinglées
  // évite qu’un json.py/argparse.py ajouté au projet soit importé par Python.
  const bootstrap = 'import importlib.util,runpy,sys,pathlib\nroot=pathlib.Path(sys.argv[1])\nfor name in ("config_utils","setup","setup_check"):\n spec=importlib.util.spec_from_file_location(name,root/(name+".py"))\n module=importlib.util.module_from_spec(spec)\n sys.modules[name]=module\n spec.loader.exec_module(module)\nsys.argv=sys.argv[2:]\nrunpy.run_path(sys.argv[0],run_name="__main__")'
  const args = ['run', '--offline', '--no-project', '--no-config', '--python', python, '--', python, '-B', '-I', '-S', '-c', bootstrap, dirname(script), script, '--project-root', profile.rootPath, ...(kind === 'agent' ? ['--skill', dirname(profile.skillPath), '--key', 'agent'] : ['--key', 'core.output_folder', '--key', 'core.active_initiative'])]
  const env = { ...Object.fromEntries(Object.entries(process.env).filter(([key]) => ['SYSTEMROOT', 'WINDIR', 'TEMP', 'TMP', 'PATH'].includes(key.toUpperCase()))), UV_CACHE_DIR: join(tmpdir(), 'madness-uv-cache') }
  const child = spawn(uv, args, { cwd: profile.rootPath, env, shell: false, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] })
  let bytes = 0, output = '', timer: ReturnType<typeof setTimeout> | undefined
  child.stdout.setEncoding('utf8'); child.stdout.on('data', chunk => { bytes += Buffer.byteLength(chunk); if (bytes <= 262144) output += chunk; else child.kill() })
  child.stderr.on('data', chunk => { bytes += chunk.length; if (bytes > 262144) child.kill() })
  const abort = (): void => { child.kill() }; signal.addEventListener('abort', abort, { once: true })
  try {
    const code = await Promise.race([new Promise<number | null>((resolve, reject) => { child.once('close', resolve); child.once('error', reject) }), new Promise<never>((_, reject) => { timer = setTimeout(() => { child.kill(); reject(dialogueFailure('RESOLVER_FAILED')) }, 15000) })])
    signal.throwIfAborted()
    if (code !== 0 || bytes > 262144) throw dialogueFailure('RESOLVER_FAILED')
    let result: unknown; try { result = JSON.parse(output) } catch { throw dialogueFailure('RESOLVER_FAILED') }
    if (!isRecord(result)) throw dialogueFailure('RESOLVER_FAILED')
    if (kind === 'agent') { const agent = result.agent; if (!isRecord(agent) || agent.name !== 'Mary' || !Array.isArray(agent.menu) || !agent.menu.length || !Array.isArray(agent.activation_steps_prepend) || agent.activation_steps_prepend.length || !Array.isArray(agent.activation_steps_append) || agent.activation_steps_append.length || !Array.isArray(agent.persistent_facts) || agent.persistent_facts.length) throw dialogueFailure('PROFILE_UNRECOGNIZED') }
    else if (typeof result['core.output_folder'] !== 'string') throw dialogueFailure('PROFILE_UNRECOGNIZED')
    return output
  } finally { clearTimeout(timer); signal.removeEventListener('abort', abort); if (!await stopNative(child)) throw dialogueFailure('STOP_UNCONFIRMED') }
}
