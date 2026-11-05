import {createContext,useContext,useLayoutEffect,useMemo,useRef,useState} from 'react'
import type {ReactNode} from 'react'
import type {Language,LanguageState} from '../../contracts/language.ts'
import {fr,en} from './strings.ts'
import type {InterfaceWords} from './strings.ts'
import {interfaceCopy} from './interface-copy.ts'
import type {InterfaceCopyKey} from './interface-copy.ts'
export type LocaleText={language:Language;locale:string;words:InterfaceWords;ui:Record<InterfaceCopyKey,string>}
export const localeText=(language:Language):LocaleText=>({language,locale:language==='fr'?'fr-FR':'en-US',words:language==='fr'?fr:en,ui:Object.fromEntries(Object.entries(interfaceCopy).map(([key,value])=>[key,value[language]])) as Record<InterfaceCopyKey,string>})
type LocaleValue=LocaleText&{warning:LanguageState['warning'];bridgeError:boolean;pending:boolean;change:(language:Language)=>void}
const LocaleContext=createContext<LocaleValue>({...localeText('fr'),warning:null,bridgeError:false,pending:false,change:()=>{}})
export function LocaleProvider({children,initial={language:'fr',warning:null},readFailed=false}:{children:ReactNode;initial?:LanguageState;readFailed?:boolean}):ReactNode{
 const [state,setState]=useState(initial),[bridgeError,setBridgeError]=useState(readFailed),[pending,setPending]=useState(false),token=useRef(0)
 const positions=useRef<{element:Element;top:number;left:number}[]|null>(null)
 useLayoutEffect(()=>{document.documentElement.lang=state.language;const saved=positions.current;positions.current=null;for(const position of saved??[])if(position.element.isConnected){position.element.scrollTop=position.top;position.element.scrollLeft=position.left}},[state.language])
 const text=useMemo(()=>localeText(state.language),[state.language])
 const change=(language:Language):void=>{
  const version=++token.current
  positions.current=[...document.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight||e.scrollWidth>e.clientWidth).map(element=>({element,top:element.scrollTop,left:element.scrollLeft}))
  setState(current=>({...current,language}));setPending(true)
  void (async()=>{try{if(!window.madnessLanguage)throw Error('LANGUAGE_BRIDGE_UNAVAILABLE');const next=await window.madnessLanguage.setLanguage(language);if(version===token.current){setState(current=>({...current,warning:next.warning}));setBridgeError(false)}}catch{if(version===token.current)setBridgeError(true)}finally{if(version===token.current)setPending(false)}})()
 }
 return <LocaleContext.Provider value={{...text,warning:state.warning,bridgeError,pending,change}}>{children}</LocaleContext.Provider>
}
export const useLocale=():LocaleValue=>useContext(LocaleContext)
// A local notice stores its semantics/parameters, never a rendered French sentence.
// Re-presenting it on a locale change does not announce a new domain arrival.
export function useLocalText<T extends string|null>(initial:T|((text:LocaleText)=>T)):[T,(value:T|((text:LocaleText)=>T))=>void]{
 const text=useLocale(),[resolver,setResolver]=useState<((text:LocaleText)=>T)>(()=>typeof initial==='function'?initial:()=>initial)
 return [resolver(text),value=>setResolver(()=>typeof value==='function'?value:()=>value)]
}
export function LanguageControl():ReactNode{
 const {language,warning,bridgeError,pending,change}=useLocale(),english=language==='en'
 return <div className="language-control"><button type="button" className="language-toggle" aria-label={english?'Passer l’interface en français':'Switch interface to English'} title={english?'Passer l’interface en français':'Switch interface to English'} aria-busy={pending} onPointerDown={event=>event.preventDefault()} onClick={()=>change(english?'fr':'en')}>{english?'EN':'FR'}</button>{(warning||bridgeError)&&<p className="language-warning small" role="status">{bridgeError?(english?'Language kept for this session — bridge unavailable. Retry with the language command.':'Langue conservée pour cette session — pont indisponible. Réessayez avec la commande de langue.'):warning==='save-failed'?(english?'Language kept for this session — save failed. Existing file preserved.':'Langue conservée pour cette session — enregistrement échoué. Fichier existant préservé.'):(english?'Language preference unreadable — initial French fallback. Existing file preserved.':'Préférence de langue illisible — français de secours initial. Fichier existant préservé.')}</p>}</div>
}
