import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

// A first manifest for a folder the team already has, guessed from file names, to adjust in the kit screen.
type Guess = { kind: 'docs' | 'glossary'; level: 'impose' | 'consulte'; for: string[] }
function guess(name: string): Guess {
  const n = name.toLowerCase()
  if (/glossaire|glossary|vocabulaire|lexique/.test(n)) return { kind: 'glossary', level: 'impose', for: ['all'] }
  if (/charte|design|(^|[^a-z])ui([^a-z]|$)|tokens|couleur|typo/.test(n)) return { kind: 'docs', level: 'impose', for: ['ux', 'dev', 'review'] }
  if (/convention|standard|coding|style|guide/.test(n)) return { kind: 'docs', level: 'impose', for: ['dev', 'review'] }
  if (/architecture|adr/.test(n)) return { kind: 'docs', level: 'consulte', for: ['architect', 'dev'] }
  return { kind: 'docs', level: 'consulte', for: ['all'] }
}
const slug = (name: string): string => name.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'mon-kit'
const piece = (kind: string, title: string, path: string, level: string, roles: string[]): string =>
  '[[piece]]\nkind = "' + kind + '"\ntitle = ' + JSON.stringify(title) + '\npath = ' + JSON.stringify(path) + '\nlevel = "' + level + '"\nfor = [' + roles.map(role => '"' + role + '"').join(', ') + ']\n'

export async function draftManifest(folder: string, name: string): Promise<string> {
  const pieces: string[] = []
  const entries = (await readdir(folder, { withFileTypes: true })).filter(entry => !entry.name.startsWith('.') && entry.name !== 'madness-kit.toml' && entry.name !== 'skills')
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, 'fr'))) {
    if (entry.isDirectory()) { const g = guess(entry.name); pieces.push(piece(g.kind, entry.name, entry.name + '/*', g.level, g.for)) }
    else if (/\.(md|markdown|txt|html?)$/i.test(entry.name)) { const g = guess(entry.name); pieces.push(piece(g.kind, entry.name.replace(/\.[^.]+$/, ''), entry.name, g.level, g.for)) }
  }
  for (const skill of (await readdir(join(folder, 'skills'), { withFileTypes: true }).catch(() => [])).filter(entry => entry.isDirectory()))
    pieces.push(piece('skill', skill.name, 'skills/' + skill.name, 'consulte', ['dev']))
  return '# Proposé par Madness à partir du dossier : ajuste les niveaux (impose / consulte) et les rôles.\n[kit]\nid = "' + slug(name) + '"\nname = ' + JSON.stringify(name) + '\nversion = "0.1.0"\nformat = 1\n\n' + pieces.join('\n')
}
