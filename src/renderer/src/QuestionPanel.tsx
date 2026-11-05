import {useLocale,useLocalText} from './Locale.tsx'
import type {ReactNode} from 'react'
import type {QuestionRecord,QuestionValues} from '../../contracts/questions.ts'
import {validQuestionValues} from '../../contracts/questions.ts'
import {MAX_DRAFT_LENGTH} from '../../contracts/index.ts'
import {fr} from './strings.ts'

export function QuestionPanel({question,values,projectName,onChange,onSend,bridgeFailed=false,respondable=true,compactContext=false}:{question:QuestionRecord;values:QuestionValues;projectName:string;onChange:(values:QuestionValues)=>void;onSend:()=>void;bridgeFailed?:boolean;respondable?:boolean;compactContext?:boolean}):ReactNode{
 const {words:fr,ui}=useLocale()

 const active=question.status==='waiting'&&respondable,recipient=question.identity.kind==='attested'?question.identity.name:fr.conversation.unknownAgent
 const prefix=question.id,titleId=prefix+'-title',statusId=prefix+'-status'
 const status=question.status==='waiting'&&!respondable?fr.overview.targetGone:fr.questions[question.status]
 return <section className="question-panel" aria-labelledby={titleId} data-question-id={question.id}>
  <div className="question-heading"><h2 id={titleId} tabIndex={-1}>{active?fr.questions.title:question.status==='sending'?ui.sending_response:ui.retained_question}</h2><span className="small">{recipient} · Codex</span></div>
  <p className="question-context">{compactContext?<span title={projectName}>{ui.this_project}</span>:projectName} {ui.captured_initiative} {question.context.initiativeId??ui.no_identified_initiative}</p>
  <p className="small question-status" id={statusId} role="status">{status}{question.reason==='expired'?ui.the_known_time_limit_was_exceeded:question.reason==='reopened'?' '+fr.questions.historical:''}</p>
  <form onSubmit={event=>{event.preventDefault();if(active&&validQuestionValues(question.fields,values,true))onSend()}} aria-describedby={statusId}>
   {question.fields.map(field=>{
    const value=values[field.id]??'',fieldId=prefix+'-'+field.id,selected=field.options.some(option=>option.label===value)
    return <fieldset key={field.id} className="question-field"><legend>{field.header}</legend><p id={fieldId+'-prompt'}>{field.prompt}</p>
     {field.options.length>0&&<div className="question-options">{field.options.map((option,index)=><label key={option.label} className="question-option" htmlFor={fieldId+'-'+index}><input id={fieldId+'-'+index} type="radio" name={fieldId} value={option.label} checked={value===option.label} disabled={!active} aria-describedby={fieldId+'-'+index+'-description'} onChange={()=>onChange({...values,[field.id]:option.label})}/><span><strong>{option.label}</strong><small id={fieldId+'-'+index+'-description'}>{option.description}</small></span></label>)}</div>}
     {(!field.options.length||field.allowOther)&&<div className="question-other"><label htmlFor={fieldId+'-text'}>{field.options.length?fr.questions.other:ui.your_response}</label><textarea id={fieldId+'-text'} value={selected?'':value} readOnly={!active} maxLength={MAX_DRAFT_LENGTH} rows={2} aria-describedby={fieldId+'-prompt'} onChange={event=>onChange({...values,[field.id]:event.target.value})}/></div>}
    </fieldset>
   })}
   <div className="question-footer"><p className="small">{bridgeFailed?fr.questions.bridgeFailed:question.storage==='stored'?fr.questions.saved:fr.questions.unsaved}</p>{bridgeFailed&&active&&<button className="text-button" type="button" onClick={()=>onChange(values)}>{ui.retry_save}</button>}{active&&<button className="secondary" type="submit" disabled={!validQuestionValues(question.fields,values,true)||bridgeFailed}>{fr.questions.send}</button>}</div>
  </form>
  <p className="small muted">{fr.questions.scope}</p>
  {question.identity.kind==='attested'&&<p className="small muted">{ui.attested_identity_source} <code>{question.identity.source}</code></p>}
 </section>
}
