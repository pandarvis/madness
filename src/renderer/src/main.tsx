import type {LanguageState} from '../../contracts/language.ts'
import {LocaleProvider} from './Locale.tsx'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import './styles.css'
import './atelier-immersion.css'
import './atelier-controls.css'
import './initiatives.css'
import './progress.css'
async function mount(): Promise<void> {
  // L’amorce native sert au secours ; Main détient le choix courant après un reload.
  let appearance = window.madnessAppearance.initial
  let appearanceReadFailed = false
  try { appearance = await window.madnessAppearance.read() }
  catch { appearanceReadFailed = true }
  let language:LanguageState = window.madnessLanguage?.initial??{language:'fr',warning:'read-failed'}
  let languageReadFailed = false
  try { if(!window.madnessLanguage)throw Error('LANGUAGE_BRIDGE_UNAVAILABLE');language = await window.madnessLanguage.read() }
  catch { languageReadFailed = true }
  document.documentElement.lang = language.language
  document.documentElement.dataset.theme = appearance.theme
  createRoot(document.getElementById('root')!).render(<LocaleProvider initial={language} readFailed={languageReadFailed}><App initialAppearance={appearance} appearanceReadFailed={appearanceReadFailed} /></LocaleProvider>)
}
void mount()

import './catalog.css'
