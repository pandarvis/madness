import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import './styles.css'
async function mount(): Promise<void> {
  // L’amorce native sert au secours ; Main détient le choix courant après un reload.
  let appearance = window.madnessAppearance.initial
  let appearanceReadFailed = false
  try { appearance = await window.madnessAppearance.read() }
  catch { appearanceReadFailed = true }
  document.documentElement.dataset.theme = appearance.theme
  createRoot(document.getElementById('root')!).render(<App initialAppearance={appearance} appearanceReadFailed={appearanceReadFailed} />)
}
void mount()
