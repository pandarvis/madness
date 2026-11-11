import { parse } from 'smol-toml'
import { KIT_ROLES } from './roles.ts'
import type { KitRole } from './roles.ts'

// The madness-kit.toml format: a team's references (charter, conventions, vocabulary, rules…)
// declared once, then translated by Madness into BMad's own overrides.
export type KitLevel = 'impose' | 'consulte'
export type PieceKind = 'docs' | 'glossary' | 'rules' | 'skill' | 'starter' | 'reference' | 'mcp' | 'assets'
export type KitPiece = { kind: PieceKind; title: string; path: string | null; level: KitLevel; for: KitRole[]; source: string | null; name: string | null }
export type KitRule = { id: string; text: string; level: KitLevel; for: KitRole[] }
export type Kit = { id: string; name: string; version: string; description: string; pieces: KitPiece[]; rules: KitRule[] }
export type ManifestResult = { ok: true; kit: Kit; notices: string[] } | { ok: false; errors: string[] }

const KINDS: readonly PieceKind[] = ['docs', 'glossary', 'rules', 'skill', 'starter', 'reference', 'mcp', 'assets']
// Accepted by the format today, handled by Madness in a later step.
const LATER: readonly PieceKind[] = ['skill', 'starter', 'reference', 'mcp']
const NEEDS_PATH: readonly PieceKind[] = ['docs', 'glossary', 'rules', 'assets', 'skill']
const text = (value: unknown): string => typeof value === 'string' ? value.trim() : ''
const insideKit = (path: string): boolean => !!path && !/^([a-z]:|[\\/])/i.test(path) && !path.split(/[\\/]/).includes('..')
const level = (value: unknown): KitLevel => value === 'impose' ? 'impose' : 'consulte'
const isRole = (value: string): value is KitRole => (KIT_ROLES as readonly string[]).includes(value)

function roles(value: unknown, where: string, errors: string[]): KitRole[] {
  const list = Array.isArray(value) ? value.map(text) : []
  if (!list.length) { errors.push(where + ' : « for » doit nommer au moins un rôle.'); return [] }
  for (const role of list) if (!isRole(role)) errors.push(where + ' : rôle « ' + role + ' » inconnu (' + KIT_ROLES.join(', ') + ').')
  return list.filter(isRole)
}

export function parseKitManifest(source: string): ManifestResult {
  let data: Record<string, unknown>
  try { data = parse(source) as Record<string, unknown> } catch (error) { return { ok: false, errors: ['Manifeste illisible : ' + (error instanceof Error ? error.message.split('\n')[0] : 'TOML invalide')] } }
  const errors: string[] = [], notices: string[] = []
  const head = (data.kit && typeof data.kit === 'object' ? data.kit : {}) as Record<string, unknown>
  const id = text(head.id), name = text(head.name), version = text(head.version)
  if (!/^[a-z0-9][a-z0-9-]{0,62}$/.test(id)) errors.push('kit.id doit être en minuscules, chiffres et tirets.')
  if (!name) errors.push('kit.name est obligatoire.')
  if (!/^\d+\.\d+\.\d+(-[0-9a-z.-]+)?$/i.test(version)) errors.push('kit.version doit être une version sémantique (1.4.0).')
  if (head.format !== undefined && head.format !== 1) errors.push('format ' + String(head.format) + ' inconnu : cette version de Madness lit le format 1.')
  const pieces: KitPiece[] = (Array.isArray(data.piece) ? data.piece : []).map((raw: unknown, index: number) => {
    const piece = (raw ?? {}) as Record<string, unknown>, where = 'pièce ' + (index + 1), kind = text(piece.kind) as PieceKind
    if (!KINDS.includes(kind)) errors.push(where + ' : type « ' + kind + ' » inconnu (' + KINDS.join(', ') + ').')
    const path = text(piece.path) || null
    if (path && !insideKit(path)) errors.push(where + ' : le chemin « ' + path + ' » sort du kit.')
    if (!path && NEEDS_PATH.includes(kind)) errors.push(where + ' : « path » est obligatoire pour une pièce ' + kind + '.')
    const result: KitPiece = { kind, title: text(piece.title) || text(piece.name) || path || kind, path, level: level(piece.level), for: kind === 'starter' ? [] : roles(piece.for, where, errors), source: text(piece.source) || null, name: text(piece.name) || null }
    if (LATER.includes(kind)) notices.push('La pièce « ' + result.title + ' » (' + kind + ') sera prise en charge dans une prochaine version de Madness.')
    return result
  })
  const rules: KitRule[] = (Array.isArray(data.rule) ? data.rule : []).map((raw: unknown, index: number) => {
    const rule = (raw ?? {}) as Record<string, unknown>, where = 'règle ' + (index + 1)
    if (!text(rule.text)) errors.push(where + ' : « text » est obligatoire.')
    return { id: text(rule.id) || 'regle-' + (index + 1), text: text(rule.text), level: level(rule.level), for: roles(rule.for, where, errors) }
  })
  if (errors.length) return { ok: false, errors }
  return { ok: true, kit: { id, name, version, description: text(head.description), pieces, rules }, notices }
}
