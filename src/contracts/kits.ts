import type { Kit } from '../core/kits/manifest.ts'

// Shapes the kits channel carries between main and the renderer.
export type FoundKit = { folder: string; ok: true; kit: Kit; notices: string[] } | { folder: string; ok: false; errors: string[] }
export type ActiveKit = { id: string; name: string; version: string; source: string; hash: string }
