import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { randomBytes } from 'node:crypto'

// Adaptation du starter officiel React-TS : preload CJS auto-suffisant pour sandbox.
export default defineConfig(({ command }) => {
  const nonce = command === 'serve' ? randomBytes(16).toString('hex') : undefined
  if (nonce) process.env.MADNESS_DEV_CSP_NONCE = nonce
  return {
    main: { build: { rollupOptions: { output: { format: 'cjs' } } } },
    preload: { build: { rollupOptions: { output: { format: 'cjs' }, external: ['electron'] } } },
    renderer: {
      html: nonce ? { cspNonce: nonce } : undefined,
      plugins: [react()],
      server: { host: '127.0.0.1', port: 5173, strictPort: true },
      build: { target: 'es2022' }
    }
  }
})
