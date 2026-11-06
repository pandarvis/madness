import assert from 'node:assert/strict'
import {test} from 'node:test'
import {createHash,randomUUID} from 'node:crypto'
import {claudeArgs,claudeEnvironment,parseClaudeResult,personalSubscription,buildClaudePrompt,runClaudeProbe} from '../src/adapters/claude/dialogue.ts'

const sessionId=randomUUID()
const terminal={type:'result',subtype:'success',is_error:false,num_turns:1,result:'Réponse',session_id:sessionId,total_cost_usd:0.25}

test('les arguments désactivent outils et sessions, la réponse doit appartenir à ce tour',()=>{
  const args=claudeArgs(sessionId)
  assert.equal(args[args.indexOf('--tools')+1],'')
  assert.equal(args[args.indexOf('--disallowedTools')+1],'mcp__*')
  assert.equal(args[args.indexOf('--session-id')+1],sessionId)
  for(const flag of ['--restricted','--safe-mode','--strict-mcp-config','--no-session-persistence','--disable-slash-commands'])assert.ok(args.includes(flag))
  assert.equal(parseClaudeResult(JSON.stringify(terminal),sessionId),'Réponse')
  for(const changed of [{session_id:randomUUID()},{num_turns:2},{is_error:true},{result:' '},{type:'assistant'}])
    assert.throws(()=>parseClaudeResult(JSON.stringify({...terminal,...changed}),sessionId),{code:'CLAUDE_FAILED'})
  assert.throws(()=>parseClaudeResult(JSON.stringify(terminal)+'\n'+JSON.stringify(terminal),sessionId),{code:'CLAUDE_FAILED'})
})

test('l’environnement et l’état auth ne transmettent ni clés ni configuration de gateway',()=>{
  const env=claudeEnvironment({SystemRoot:'C:\\Windows',PATH:'C:\\project',ANTHROPIC_API_KEY:'secret',CLAUDE_CODE_OAUTH_TOKEN:'secret',ANTHROPIC_BASE_URL:'https://proxy',CLAUDE_CONFIG_DIR:'C:\\foreign',HOME:'C:\\foreign'},'C:\\owner','C:\\owner\\Roaming','C:\\owner\\Local','C:\\isolated')
  assert.deepEqual(Object.keys(env).filter(k=>['ANTHROPIC_API_KEY','CLAUDE_CODE_OAUTH_TOKEN','ANTHROPIC_BASE_URL','CLAUDE_CONFIG_DIR'].includes(k)),[])
  assert.equal(env.USERPROFILE,'C:\\owner')
  assert.equal(env.TEMP,'C:\\isolated')
  assert.ok(!env.Path.includes('project'))
  const auth={loggedIn:true,authMethod:'claude.ai',apiProvider:'firstParty',subscriptionType:'max',email:'must not be returned'}
  assert.equal(personalSubscription(JSON.stringify(auth)),true)
  for(const changed of [{loggedIn:false},{authMethod:'api_key'},{apiProvider:'bedrock'},{subscriptionType:'team'}])
    assert.equal(personalSubscription(JSON.stringify({...auth,...changed})),false)
})

test('le prompt préserve exactement la compétence épinglée et réduit le contexte à l’identifiant actif',()=>{
  const skill='Mary — contenu approuvé\r\n'
  const source={sha256:createHash('sha256').update(skill).digest('hex'),bytes:Buffer.byteLength(skill)}
  const context={initiativeId:'initiative-local',observation:{rootPath:'C:/private',sources:[{path:'secret',sha256:'secret'}]}}
  const prompt=buildClaudePrompt(skill,source,context)
  assert.ok(prompt.includes(skill))
  assert.ok(prompt.includes('initiative-local'))
  assert.ok(!prompt.includes('secret')&&!prompt.includes('C:/private'))
  assert.throws(()=>buildClaudePrompt(skill+'!',source,context),{code:'PROFILE_CHANGED'})
})


test('annuler une sonde attend le close et conserve une preuve locale',async()=>{
  const events=[]
  const controller=new AbortController()
  const owner={
    begin:async()=> 'run-1',
    capture:async()=>{controller.abort()},
    closed:async(_,confirmed)=>{events.push(confirmed);return true}
  }
  await assert.rejects(()=>runClaudeProbe(process.execPath,['-e','setInterval(() => {}, 1000)'],{
    cwd:process.cwd(),env:process.env,shell:false,windowsHide:true
  },controller.signal,owner,()=>events.push('unknown')),{name:'AbortError'})
  assert.deepEqual(events,[true])
})

test('une preuve de fermeture non enregistrée bloque la sonde',async()=>{
  const events=[]
  const owner={begin:async()=> 'run-1',capture:async()=>{},closed:async()=>false}
  await assert.rejects(()=>runClaudeProbe(process.execPath,['--version'],{
    cwd:process.cwd(),env:process.env,shell:false,windowsHide:true
  },new AbortController().signal,owner,()=>events.push('unknown')),{code:'STOP_UNCONFIRMED'})
  assert.deepEqual(events,['unknown'])
})
