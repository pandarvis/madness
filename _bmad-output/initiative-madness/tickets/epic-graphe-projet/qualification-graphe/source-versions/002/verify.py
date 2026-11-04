"""Independent evidence verifier: no worker import and no Graphify execution."""
import sys,json,hashlib,zipfile,re,copy
from pathlib import Path,PurePosixPath
output=Path(sys.argv[1]).resolve();assembly=Path(sys.argv[2]).resolve();here=Path(__file__).resolve().parent
load=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
sha=lambda b:hashlib.sha256(b).hexdigest()
m=load(assembly);matrix=load(output/'matrix.json');checks=[];graphs={};observations=[]
def require(value,name,detail=None):
    checks.append({'check':name,'passed':bool(value),'detail':detail})
    if not value:raise AssertionError(name+': '+str(detail))
def admit(g,corpus):
    if not isinstance(g,dict) or g.get('graph',{}).get('schema_version')!=1 or g.get('graph',{}).get('graphify_version')!='0.9.101':raise ValueError('FORMAT_IDENTITY')
    if not isinstance(g.get('nodes'),list) or not isinstance(g.get('links'),list):raise ValueError('FORMAT_SHAPE')
    nodes={n.get('id'):n for n in g['nodes']}
    if len(nodes)!=len(g['nodes']) or any(not isinstance(n,str) or not n for n in nodes):raise ValueError('NODE_IDENTITY')
    relations=[];unknown=[]
    def reference(item):
        f=item.get('source_file')
        if not f:unknown.append({'reason':'source-file-missing','item':item.get('id')});return
        if not isinstance(f,str) or '\\' in f or ':' in f or PurePosixPath(f).is_absolute() or '..' in PurePosixPath(f).parts or f not in corpus:raise ValueError('SOURCE_REFERENCE')
        loc=item.get('source_location')
        if loc is None or loc=='':unknown.append({'reason':'location-missing','file':f});return
        line=int(loc[1:]) if isinstance(loc,str) and re.fullmatch(r'L[1-9][0-9]*',loc) else loc if isinstance(loc,int) and not isinstance(loc,bool) and loc>0 else None
        if line is None:unknown.append({'reason':'location-unrecognized','raw':loc,'file':f});return
        if line>len(corpus[f].decode('utf-8').splitlines()):raise ValueError('SOURCE_LINE')
    for n in g['nodes']:reference(n)
    for e in g['links']:
        if ('_src' in e)!=('_tgt' in e):raise ValueError('PARTIAL_DIRECTION')
        a,b=(e['_src'],e['_tgt']) if '_src' in e else (e.get('source'),e.get('target'))
        if a not in nodes or b not in nodes:raise ValueError('EDGE_REFERENCE')
        if e.get('confidence') not in ('EXTRACTED','INFERRED','AMBIGUOUS'):raise ValueError('CONFIDENCE')
        score=e.get('confidence_score')
        if score is not None and (isinstance(score,bool) or not isinstance(score,(int,float)) or not 0<=score<=1):raise ValueError('CONFIDENCE_SCORE')
        reference(e);relations.append((a,b,e.get('relation'),e.get('confidence'),e.get('source_file'),e.get('source_location')))
    return {'nodes':len(nodes),'links':len(relations),'relations':relations,'unknowns':unknown,'confidences':sorted(set(r[3] for r in relations))}
try:
    require(m['baseCount']==735 and len(m['runtime'])==735,'runtime-base735')
    require(len(m['wheels'])==31 and all(w['filename'].endswith('.whl') for w in m['wheels']),'binary-wheels31')
    for section,folder in [('runtime','runtime'),('packages','packages')]:
        root=Path(m['owner'],folder);got={p.relative_to(root).as_posix():sha(p.read_bytes()) for p in root.rglob('*') if p.is_file()}
        require(got=={r['name']:r['sha256'] for r in m[section]},'closed-'+section,len(got))
    for w in m['wheels']:require(sha(Path(m['owner'],'wheels',w['filename']).read_bytes())==w['sha256'],'wheel:'+w['name'])
    require(all(r['equal'] for r in load(here/'source-comparison.json')),'research-wheel8-identical')
    require(not any(any(x in w['name'].lower() for x in ['tiktoken','openai','anthropic','graspologic','docx','openpyxl','pypdf','boto','mcp']) for w in m['wheels']),'extras-absent')
    require(len({r['analysis'] for r in matrix['cases']})==len(matrix['cases']),'analyses-distinct')
    for row in matrix['cases']:
        case=row['case'];d=output/case;t=load(d/'terminal.json')
        require(t==row['terminal'] and t['knownStopped'] and t['jobActive']==0,case+':known-stop')
        require(load(d/'source-before.json')==row['before'] and load(d/'source-after.json')==row['after'],case+':source-receipts')
        require(row['sourceUnchanged']==(row['before']==row['after']),case+':freshness-observed')
        require(row['sourceUnchanged'] or case=='G6-mutation',case+':preserved-source')
        require(load(d/'home-before.json')==load(d/'home-after.json') and row['homeUnchanged'],case+':preserved-home')
        with zipfile.ZipFile(d/'native-output.zip') as z:
            require(set(z.namelist())=={a['name'] for a in row['artifacts']},case+':artifact-inventory')
            for a in row['artifacts']:require(sha(z.read(a['name']))==a['sha256'],case+':artifact:'+a['name'])
        if (d/'worker.json').exists():
            w=load(d/'worker.json');require(w['case']==case and w['analysis']==row['analysis'] and w['project']==row['project'],case+':identity')
            require(w['flags']=={'isolated':1,'no_site':1,'bytecode':True},case+':python-isolation')
            require(w.get('network_probe_refused') and w.get('process_probe_refused') and w.get('write_probe_refused'),case+':controls-active')
            active=[e for e in w['events'] if e['phase']=='graphify']
            require(not any(e['event']=='network-denied' for e in active),case+':no-network-attempt')
            require(not any(e['event']=='write-denied' for e in active),case+':no-outside-write-attempt')
            require(not any(k.endswith(('API_KEY','ACCESS_TOKEN','REFRESH_TOKEN','SECRET')) for k in w['env']),case+':no-credentials-env')
            require(w['env']['GRAPHIFY_BACKEND']=='none' and w['env']['GRAPHIFY_NO_AUTO_REFRESH']=='1' and w['env']['GRAPHIFY_OUT']=='graphify-out',case+':effective-profile')
            roots=[Path(m['owner'],'runtime'),Path(m['owner'],'packages'),here/'worker.py']
            for i in w['imports']:
                f=Path(i['file']);require(any(f==r or f.is_relative_to(r) for r in roots),case+':import:'+i['name'])
            require(w['peakWorkingSetBytes']>0,case+':memory-measured')
        if case.startswith('G1-') or case in ('G3-reused-output','G4-link'):
            require(t['neverStarted'] and not (d/'worker.json').exists(),case+':refused-before-uv')
            continue
        ex=load(d/'execution.json');require(ex['job_assigned_before_resume'] and ex['job_active_after_stop']==0,case+':job-owned')
        if case in ('G7-cancel','G7-timeout'):
            require(ex['outcome']==('cancelled' if case.endswith('cancel') else 'timeout'),case+':stop-reason')
            require(load(d/'ready')['phase']=='extract-entry-before-parsing' and load(d/'ready')['files']>=20,case+':phase-and-corpus')
            require(not (d/'native-graph.json').exists(),case+':no-complete-artifact')
            continue
        if (d/'native-graph.json').exists():
            require(w['outcome']=='completed' and ex['outcome']=='completed' and ex['exit']==0,case+':completed-native-artifact')
            g=load(d/'native-graph.json');corpus={p.relative_to(d/'corpus').as_posix():p.read_bytes() for p in (d/'corpus').rglob('*') if p.is_file()}
            if case=='G5-raw':
                try:admit(g,corpus)
                except ValueError:pass
                else:raise AssertionError('raw admitted as schema1')
                observations.append({'case':case,'rawKeys':sorted(g),'admitted':False});continue
            profile=admit(g,corpus);graphs[case]=(g,corpus,profile)
            observations.append({'case':case,**profile,'worker_ms':w['elapsed_ms'],'peakWorkingSetBytes':w['peakWorkingSetBytes'],'artifactBytes':sum(a['bytes'] for a in row['artifacts']),'current':row['sourceUnchanged'],'stderr':(d/'stderr.log').read_text(encoding='utf-8')})
        else:require(case=='G4-outside-config',case+':graph-required-or-explicit-reference-refusal')
    gitgraph=graphs['G4-git'][0]
    require(any(n['id']=='main_compute_uncommitted' for n in gitgraph['nodes']),'git-noncommitted-observed')
    require(any(n.get('source_file')=='untracked.py' for n in gitgraph['nodes']),'git-untracked-observed')
    require(not any(n.get('source_file')=='ignored.py' for n in gitgraph['nodes']),'git-ignored-observed')
    require('expected key=value' in (output/'G4-config/stderr.log').read_text(encoding='utf-8'),'invalid-rc-explicit-warning')
    require('tree_sitter_sql not installed' in (output/'G8-incomplete/stderr.log').read_text(encoding='utf-8'),'partial-sql-explicit-warning')
    require(not any(str(n.get('source_file','')).endswith(('.pdf','.xlsx','.docx','.gdoc')) for n in graphs['G4-mixed'][0]['nodes']),'mixed-no-document-nodes')
    nominal,corpus,p=graphs['G2-nominal']
    for a,b in [('main_compute','math_ops_add'),('typed_main_run','typed_util_double'),('web_main_start','web_util_greet'),('dotnet_program_demo_program_compute','dotnet_math_demo_mathops_add')]:require(any(r[:3]==(a,b,'calls') for r in p['relations']),'nominal-call:'+a)
    require('INFERRED' in p['confidences'],'code-only-preserves-inferred')
    require(any(r[2]=='imports' for r in p['relations']),'imports-observed')
    require(len(corpus)>=20,'at-least20-files')
    require(not any('beta_only' in n['id'] for n in nominal['nodes']),'alpha-not-beta')
    require(any('beta_only' in n['id'] for n in graphs['G6-beta'][0]['nodes']),'beta-is-distinct')
    require(not next(r for r in matrix['cases'] if r['case']=='G6-mutation')['sourceUnchanged'],'mutation-never-current')
    mutants=[]
    def reject(name,change):
        g=copy.deepcopy(nominal);change(g)
        try:admit(g,corpus)
        except ValueError as e:mutants.append({'case':name,'outcome':'refused','reason':str(e)})
        else:raise AssertionError('mutant-admitted:'+name)
    reject('schema-unknown',lambda g:g['graph'].update(schema_version=99))
    reject('tool-unknown',lambda g:g['graph'].update(graphify_version='unknown'))
    reject('traversal',lambda g:g['nodes'][0].update(source_file='../outside.py'))
    reject('absolute',lambda g:g['nodes'][0].update(source_file='C:/outside.py'))
    reject('confidence-unknown',lambda g:g['links'][0].update(confidence='CERTAIN'))
    reject('confidence-score-invalid',lambda g:g['links'][0].update(confidence_score=2))
    reject('missing-endpoint',lambda g:g['links'][0].update(target='missing'))
    reject('location-outside-file',lambda g:g['nodes'][0].update(source_location='L99999'))
    direction=copy.deepcopy(nominal);e=direction['links'][0];a,b=e['source'],e['target'];e.update(_src=a,_tgt=b,source=b,target=a)
    require(admit(direction,corpus)['relations'][0][:2]==(a,b),'_src-_tgt-take-priority-directed-false')
    unknown=copy.deepcopy(nominal);unknown['nodes'][0]['source_location']='L1-L3'
    require(any(u['reason']=='location-unrecognized' for u in admit(unknown,corpus)['unknowns']),'no-invented-line-range')
    (output/'format-mutants.json').write_text(json.dumps(mutants,indent=2),encoding='utf-8')
    before=load(output/'inputs-before.json');after=load(output/'inputs-after.json')
    require(len(before)==203 and before==after and all(r['expected']==r['actual'] for r in before),'product203-inputs-unchanged')
    require(len(matrix['cases'])==18,'complete-matrix18',len(matrix['cases']))
    report={'passed':True,'cases':len(matrix['cases']),'skips':0,'checks':len(checks),'observations':observations,'formatMutants':mutants,'cleanupEligible':all(r['terminal']['knownStopped'] for r in matrix['cases']),'ownedRoot':matrix['owner'],'G5Final':False}
except BaseException as e:
    report={'passed':False,'error':str(e),'checks':len(checks),'observations':observations,'cleanupEligible':False}
(output/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
(output/'checks.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='observations'},ensure_ascii=False))
if not report['passed']:sys.exit(1)
