const screen = document.getElementById('startup-screen')!
const root = document.getElementById('root')!
const label = document.getElementById('startup-label')!
const bar = document.getElementById('startup-progress')!
const fill = document.getElementById('startup-fill')!
const errorPanel = document.getElementById('startup-error')!
const errorMessage = document.getElementById('startup-message')!
const fallback = document.getElementById('startup-fallback')!
const demo = window.madnessSplashDemo === true
let language = window.madnessLanguage?.initial.language ?? 'fr'
let settled = false
let watchdog: ReturnType<typeof setTimeout> | undefined

function setProgress(value: number): void {
  bar.setAttribute('aria-valuenow', String(value))
  fill.setAttribute('width', String(value * 320 / 100))
}

function setLabel(): void {
  document.documentElement.lang = language
  label.textContent = demo
    ? language === 'en' ? 'Demo · simulated loading' : 'Démonstration · chargement simulé'
    : language === 'en' ? 'Loading Madness…' : 'Chargement de Madness…'
}

function showFailure(slow: boolean): void {
  if (settled) return
  if (!slow) clearTimeout(watchdog)
  errorPanel.hidden = false
  errorMessage.textContent = language === 'en'
    ? slow ? 'Madness is taking longer than expected. You can wait or close and reopen the app.' : 'Madness could not start. Close and reopen the app to retry.'
    : slow ? 'Madness prend plus de temps que prévu. Tu peux patienter ou fermer puis rouvrir Madness.' : 'Madness n’a pas démarré. Ferme puis rouvre Madness pour réessayer.'
  label.hidden = true
  bar.hidden = true
}

async function showDemo(): Promise<void> {
  const duration = 2800
  const start = performance.now()
  await new Promise<void>(resolve => {
    const timer = setInterval(() => {
      const value = Math.min(100, Math.floor((performance.now() - start) / duration * 10) * 10)
      setProgress(value)
      if (value === 100) {
        clearInterval(timer)
        resolve()
      }
    }, 100)
  })
}

async function start(): Promise<void> {
  setLabel()
  fallback.remove()
  if (demo) await showDemo()
  else setProgress(10)

  watchdog = setTimeout(() => showFailure(true), 15000)
  const {mount} = await import('./main.tsx')
  await mount({
    appearanceReady: () => { if (!demo) setProgress(40) },
    preferencesReady: nextLanguage => {
      language = nextLanguage
      setLabel()
      if (!demo) setProgress(70)
    },
    workspaceSettled: restored => {
      clearTimeout(watchdog)
      if (restored && !demo) setProgress(100)
      settled = true
      screen.remove()
      root.inert = false
    },
    failed: () => showFailure(false)
  })
}

void start().catch(error => {
  console.error(error)
  showFailure(false)
})

export {}
