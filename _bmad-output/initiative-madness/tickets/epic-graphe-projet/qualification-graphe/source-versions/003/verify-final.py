"""Final independent linkage of existing receipts, sources and reconstruction.
Does not run Graphify or import fixture/worker code.
"""
import sys,json,hashlib,zipfile,re,stat
from pathlib import Path,PurePosixPath
q=Path(__file__).resolve().parent
load=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
sha=lambda b:hashlib.sha256(b).hexdigest()
save=lambda p,v:p.write_text(json.dumps(v,ensure_ascii=False,indent=2),encoding='utf-8')
checks=[]
def need(value,label):
    checks.append({'check':label,'passed':bool(value)})
    if not value:raise AssertionError(label)
def tree(root):
    got={}
    for p in root.rglob('*'):
        s=p.lstat();need(not getattr(s,'st_file_attributes',0)&0x400,'inventory-no-reparse')
        if p.is_file():need(s.st_nlink==1,'inventory-no-hardlink');got[p.relative_to(root).as_posix()]=sha(p.read_bytes())
    return got

def inputs(run):
    before=load(run/'inputs-before.json');after=load(run/'inputs-after.json')
    need(len(before)==203 and before==after and all(v['actual']==v['expected'] for v in after),str(run.name)+':product203-unchanged')

def native(run,row):
    d=run/row['case'];need(load(d/'terminal.json')==row['terminal'],'terminal-linked')
    need(row['terminal']['knownStopped'] and row['terminal']['jobActive']==0,'terminal-known0')
    need(row['sourceUnchanged'] and row['homeUnchanged'],'sources-home-preserved')
    need(load(d/'source-before.json')==load(d/'source-after.json'),'source-receipts-exact')
    need(load(d/'home-before.json')==load(d/'home-after.json'),'home-receipts-exact')
    with zipfile.ZipFile(d/'native-output.zip') as z:
        need(set(z.namelist())=={a['name'] for a in row['artifacts']},'zip-inventory')
        for a in row['artifacts']:need(sha(z.read(a['name']))==a['sha256'],'zip-native:'+a['name'])
        if (d/'native-graph.json').exists():need((d/'native-graph.json').read_bytes()==z.read('graphify-out/graph.json'),'parsed-json-equals-native-zip-bytes')
    ex=load(d/'execution.json');need(ex['job_assigned_before_resume'] and ex['job_active_after_stop']==0,'job-before-resume-known0')
    if row['case']=='G7-cancel':
        need(ex['outcome']=='cancelled','supplement-cancel-real')
        p=load(d/'native-processes.json');need(p['rootPid']==ex['pid'],'process-root-identity')
        need(p['phase']=={'phase':'extract-entry-before-parsing','files':33},'process-phase33')
        need(len(p['processes'])==3 and {v['exe'] for v in p['processes']}=={'uv.exe','python.exe','conhost.exe'},'three-real-process-identities')
        need(all(v['pid']==p['rootPid'] or v['parent']==p['rootPid'] for v in p['processes']),'snapshot-descendants-attributable')
        return {'case':row['case'],'processes':p,'execution':ex}
    w=load(d/'worker.json');need(w['outcome']=='completed' and ex['outcome']=='completed' and ex['exit']==0,'native-completed')
    need(w['env']['GRAPHIFY_BACKEND']=='none' and w['env']['GRAPHIFY_OUT']=='graphify-out' and w['env']['GRAPHIFY_NO_AUTO_REFRESH']=='1','effective-child-profile')
    active=[e for e in w['events'] if e['phase']=='graphify']
    need(not any(e['event'] in ('network-denied','write-denied') for e in active),'no-network-outside-write-observed')
    g=load(d/'native-graph.json');need(g.get('graph',{}).get('schema_version')==1 and g['graph'].get('graphify_version')=='0.9.101','native-schema1-version')
    corpus={p.relative_to(d/'corpus').as_posix():p.read_bytes() for p in (d/'corpus').rglob('*') if p.is_file()}
    ids={n['id'] for n in g['nodes']};need(len(ids)==len(g['nodes']),'native-node-ids')
    for item in [*g['nodes'],*g['links']]:
        f=item.get('source_file')
        if f:need(isinstance(f,str) and ':' not in f and '\\' not in f and '..' not in PurePosixPath(f).parts and f in corpus,'native-source-bound')
        loc=item.get('source_location')
        if f and isinstance(loc,str) and re.fullmatch('L[1-9][0-9]*',loc):need(int(loc[1:])<=len(corpus[f].decode('utf-8').splitlines()),'native-line-bound')
    for e in g['links']:
        a,b=(e['_src'],e['_tgt']) if '_src' in e and '_tgt' in e else (e['source'],e['target'])
        need(a in ids and b in ids and e['confidence'] in ('EXTRACTED','INFERRED','AMBIGUOUS'),'native-edge-confidence')
    if row['case']=='G3-inherited':
        need(row['legacyBefore']==row['legacyAfter'] and row['legacyBefore'] is not None,'legacy-schema1-preserved')
        actual=tree(Path(row['project']).parent/'forbidden-outside')
        need(actual=={n:v['sha256'] for n,v in row['legacyAfter'].items()},'legacy-still-preserved-after-all-supplements')
        old=load(Path(row['project']).parent/'forbidden-outside/graph.json')
        need(old['graph']['schema_version']==1 and old['nodes'][0]['_origin']=='semantic','legacy-real-format-semantic-variant')
        need('legacy_semantic' not in ids and all(n.get('_origin')!='semantic' for n in g['nodes']),'no-legacy-semantic-merge')
    if row['case']=='G4-valid-config':
        need(any(n.get('source_file')=='configured.tpl' and n['id']=='configured_configuredonly' for n in g['nodes']),'valid-rc-override-actually-parsed')
        need('ignoring .graphifyrc' not in (d/'stderr.log').read_text(encoding='utf-8'),'valid-rc-not-ignored')
    return {'case':row['case'],'nodes':len(g['nodes']),'links':len(g['links']),'workerMs':w['elapsed_ms'],'peakWorkingSetBytes':w['peakWorkingSetBytes'],'artifactBytes':sum(a['bytes'] for a in row['artifacts'])}

try:
    baseline=q/'runs/matrix-006';supplement=q/'runs/supplement-007'
    baseReport=load(baseline/'verification.json');need(baseReport['passed'] and baseReport['cases']==18 and baseReport['skips']==0,'base18-independent-verification')
    need(baseReport['verifierSha256']==sha((q/'verify.py').read_bytes()),'base-verifier-exact-current-source')
    seals={}
    for version in ['001','002','003']:
        folder=q/'source-versions'/version
        seals[version]={v['name']:v['sha256'] for v in load(folder/'seal.json')}
        for name,value in seals[version].items():need(sha((folder/name).read_bytes())==value,'source-archive:'+version+':'+name)
    for name in ['runner.ps1','worker.py','preflight.ps1','supervision.ps1']:
        need(len({seals[v][name] for v in seals})==1,'runtime-harness-unchanged:'+name)
        need(sha((q/name).read_bytes())==seals['001'][name],'runtime-harness-current:'+name)
    sm=load(supplement/'matrix.json');need(len(sm['cases'])==3,'three-targeted-supplements-only')
    for run,version in [(baseline,'001'),(supplement,'002')]:
        inputs(run)
        for row in load(run/'matrix.json')['cases']:
            req=load(run/row['case']/'request.json')
            for pin in req['harness']:need(pin['sha256']==seals[version][Path(pin['path']).name],'invocation-native-source-link:'+row['case'])
            if version=='002':need(row['fixtureSha256']==seals['002']['fixtures.py'],'supplement-fixture-exact-source:'+row['case'])
    observations=[native(supplement,row) for row in sm['cases']]
    a=load(q/'assembly-manifest.json');b=load(q/'assembly-reconstructed.json');receipt=load(q/'lock-reconstruction-receipt.json')
    need(receipt['passed'] and receipt['fromLock'] and not receipt['uvCompileStarted'] and receipt['uvInstallStarted'],'lock-reconstruction-no-resolution')
    need(receipt['fromOwner']==a['owner'] and a['owner']!=b['owner'],'reconstruction-owned-separate-root')
    need(len(a['runtime'])==len(b['runtime'])==735 and len(a['packages'])==len(b['packages'])==2340,'two-closed-inventories')
    for m in [a,b]:
        for key in ['runtime','packages']:need(tree(Path(m['owner'],key))=={v['name']:v['sha256'] for v in m[key]},'assembly-closed:'+key)
        for w in m['wheels']:need(sha(Path(m['owner'],'wheels',w['filename']).read_bytes())==w['sha256'],'wheel-bytes:'+w['name'])
    need(a['runtime']==b['runtime'],'runtime735-byte-identical')
    need(a['criticalModules']==b['criticalModules'],'critical8-byte-identical')
    need([(v['name'],v['version'],v['sha256']) for v in a['wheels']]==[(v['name'],v['version'],v['sha256']) for v in b['wheels']],'same31-locked-wheel-bytes')
    amap={v['name']:v['sha256'] for v in a['packages']};different=[v['name'] for v in b['packages'] if amap[v['name']]!=v['sha256']]
    need(all(n.startswith('bin/') and n.endswith('.exe') or re.fullmatch(r'.+\.dist-info/(RECORD|direct_url.json|uv_cache.json)',n) for n in different),'differences-only-generated-install-metadata-and-launchers')
    need(sha((q/'requirements.lock').read_bytes())==seals['001']['requirements.lock'],'original-lock-preserved')
    save(q/'reconstruction-differences.json',{'differentFiles':different,'count':len(different),'sameFiles':2340-len(different),'runtimeSame':735,'criticalModulesSame':8,'equivalence':'Wheel payload/source modules identical; generated metadata/entry-point launchers depend on owner path/cache. No byte equivalence of whole installations claimed.'})
    result={'passed':True,'functionalCases':{'base':18,'targetedSupplement':3,'skips':0},'assertions':{'baseVerifier':baseReport['checks'],'finalLinkage':len(checks)},'sourceVersions':{'matrix-006':'001','supplement-007':'002','reconstruction-and-final-verification':'003'},'verifierSha256':sha(Path(__file__).read_bytes()),'observations':observations,'reconstruction':{'wheels':31,'runtime':735,'packages':2340,'generatedDifferences':len(different),'noDependencyResolution':True,'noGraphifyReplay':True,'canonicalOwner':str(Path(b['owner']).resolve())},'G5Final':False}
except BaseException as e:result={'passed':False,'error':str(e),'assertions':len(checks)}
save(q/'final-verification.json',result);save(q/'final-checks.json',checks)
print(json.dumps({k:v for k,v in result.items() if k!='observations'},ensure_ascii=False))
if not result['passed']:sys.exit(1)
