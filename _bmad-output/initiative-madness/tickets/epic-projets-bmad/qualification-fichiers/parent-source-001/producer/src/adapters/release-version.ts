import manifest from '../../package.json' with { type: 'json' }

/** Une seule source pour la livraison et les deux clients du protocole Codex. */
export const releaseVersion: string = manifest.version
