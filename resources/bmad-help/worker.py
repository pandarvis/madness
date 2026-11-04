"""Madness native read-only help: data snapshots only; no project Python import."""
import contextlib,io,json,os,sys,tomllib,types,time
from pathlib import Path
import capture
import runtime_guard
import _bmad_source_closure as closure

def native(name,args):
    m=types.ModuleType('__main__');m.__file__=str(Path(__file__).parent/(name+'.py'))
    old,argv=sys.modules['__main__'],sys.argv
    class NativeOutput(io.StringIO):
        def reconfigure(self,**kwargs):pass
    out=NativeOutput();sys.modules['__main__']=m;sys.argv=[m.__file__,*args]
    try:
        with contextlib.redirect_stdout(out):
            try:exec(compile(closure.sources[name],m.__file__,'exec'),m.__dict__)
            except SystemExit as e:
                if e.code not in (None,0):raise ValueError('NATIVE_MAIN_FAILED')
        return out.getvalue()
    finally:sys.modules['__main__']=old;sys.argv=argv

def exists(p):
    capture.inspect_chain(p,missing=True)
    return p.exists()

def listing(p,all_names=False):
    capture.inspect_chain(p)
    result=[]
    for q in sorted(p.iterdir()):
        capture.inspect_chain(q)
        if all_names:result.append(q.name)
        elif q.is_dir():result.append(q.name+'/')
        if len(result)>1024:raise ValueError('INVENTORY_BOUND')
    return result

# Presence-only names from BMad migrate_v6.py LEGACY_LEFTOVERS.
# Never import the migration script or parse/read its YAML/CSV data.
LEGACY_MARKERS=(
    '_bmad/_config/manifest.yaml',
    '_bmad/_config/files-manifest.csv',
    '_bmad/_config/skill-manifest.csv',
    '_bmad/_config/bmad-help.csv',
    '_bmad/config.user.toml',
    '_bmad/core/config.yaml',
    '_bmad/core/module-help.csv',
    '_bmad/core/v6-shims',
    '_bmad/bmm/config.yaml',
    '_bmad/bmm/module-help.csv',
    '_bmad/bmm/v6-shims',
)
def legacy_presence(path):
    path=capture.long_path(path)
    try:
        capture.inspect_chain(path,missing=True)
        try:info=path.lstat()
        except FileNotFoundError:return {'path':str(path),'present':False,'identity':None,'error':None}
        return {'path':str(path),'present':True,'identity':list(capture.identity(info)),'error':None}
    except (OSError,ValueError) as error:
        return {'path':str(path),'present':None,'identity':None,'error':str(error)}


def fresh(folder):
    state=json.loads(capture.read_safe(folder/'capture.json',file_limit=4*1024*1024))
    for r in state['roots']:
        p=Path(r['path'])
        if exists(p)!=r['exists']:raise ValueError('STALE_ROOT: '+str(p))
        for rel,expected in r['dirs'].items():
            q=p/rel;capture.inspect_chain(q)
            if list(capture.identity(q.lstat()))!=expected:raise ValueError('STALE_DIRECTORY: '+str(q))
        for rel,expected in r['files'].items():
            q=p/rel
            if capture.sha(capture.read_safe(q,utf8=False))!=expected:raise ValueError('STALE_SOURCE: '+str(q))
    for p,expected,all_names in state['lists']:
        if listing(Path(p),all_names)!=expected:raise ValueError('STALE_INVENTORY: '+p)
    for marker in state.get('legacy',[]):
        if legacy_presence(marker['path'])!=marker:raise ValueError('STALE_LEGACY_PRESENCE: '+capture.display_path(marker['path']))
    for source in state.get('refused',[]):
        path=Path(source['path']);capture.inspect_chain(path)
        info=path.lstat()
        if [*capture.identity(info),info.st_size,info.st_mtime_ns,info.st_ctime_ns]!=source['identity']:raise ValueError('STALE_REFUSED_SOURCE: '+capture.display_path(path))
    for p,present in state['optional']:
        if exists(Path(p))!=present:raise ValueError('STALE_OPTIONAL: '+p)
    for source in state.get('fileIdentities',[]):
        path=Path(source['path']);capture.inspect_chain(path)
        if list(capture.identity(path.lstat()))!=source['identity']:raise ValueError('STALE_FILE_IDENTITY: '+capture.display_path(path))
    for source in state.get('copies',[]):
        if capture.sha(capture.read_safe(Path(source['snapshot']),utf8=False))!=source['sha256']:raise ValueError('STALE_COPY: '+source['snapshot'])
    return {'fresh':True}

def prepare(req):
    folder=capture.long_path(req['folder']);project=capture.long_path(req['project'])
    capture.inspect_chain(project);capture.inspect_chain(folder)
    state={'roots':[],'lists':[],'optional':[]};mapping=[];problems=[];total=0;context_valid=True
    def record(root):
        item={'path':str(root),'exists':exists(root),'dirs':{},'files':{}}
        state['roots'].append(item);return item
    def add(source,target,r):
        nonlocal total
        before=list(capture.identity(source.lstat()))
        raw=capture.read_safe(source,utf8=False);total+=len(raw)
        if list(capture.identity(source.lstat()))!=before:raise ValueError('SOURCE_REPLACED')
        state.setdefault('fileIdentities',[]).append({'path':str(source),'identity':before})
        if total>16*1024*1024 or len(mapping)>=2048:raise ValueError('CAPTURE_BOUND')
        r['files'][source.relative_to(Path(r['path'])).as_posix()]=capture.sha(raw)
        target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(raw)
        mapping.append((str(source),str(target),raw))
        return raw
    seen=set();roots=[]
    for i,original in enumerate(req['roots']):
        root=capture.long_path(original);r=record(root)
        target=folder/('skills-'+str(i));target.mkdir();roots.append(str(target))
        if not r['exists']:continue
        names=listing(root);state['lists'].append((str(root),names,False))
        for name in names:
            source=root/name.rstrip('/');dest=target/name.rstrip('/');dest.mkdir()
            r['dirs'][name.rstrip('/')]=capture.identity(source.lstat())
            if name in seen:continue
            seen.add(name)
            state['lists'].append((str(source),listing(source,True),True))
            manifest=source/'bmod.toml';present=exists(manifest);state['optional'].append((str(manifest),present))
            if present:add(manifest,dest/'bmod.toml',r)
    # Discover the native reader's actual inputs from the captured manifests.
    # No unrelated workflow or agent reference is read merely for consultation.
    import knowledge as native_knowledge
    found=native_knowledge.scan([Path(v) for v in roots])
    for module in found.modules:
        index=roots.index(str(module.folder.parent))
        original=capture.long_path(req['roots'][index])/module.folder.name
        receipt=state['roots'][index]
        selected={'help/help.md'}
        for entry in module.table.get('knowledge',[]) if isinstance(module.table.get('knowledge',[]),list) else []:
            name=entry.get('path') if isinstance(entry,dict) else None
            relative=native_knowledge.safe_skill_relative(name) if isinstance(name,str) else None
            if relative is not None:selected.add(relative.as_posix())
        help_folder=original/'help'
        if exists(help_folder):
            state['lists'].append((str(help_folder),listing(help_folder,True),True))
            selected.update('help/'+p.name for p in help_folder.iterdir() if p.suffix=='.md')
        selected.update(p.name for p in original.iterdir() if p.suffix=='.toml' and p.name not in ('bmod.toml','roster.toml','retired.toml'))
        for name in sorted(selected):
            path=original/name;present=exists(path);state['optional'].append((str(path),present))
            if present:
                capture.inspect_chain(path.parent)
                receipt['dirs'][path.parent.relative_to(Path(receipt['path'])).as_posix()]=capture.identity(path.parent.lstat())
                try:add(path,module.folder/name,receipt)
                except capture.Refusal as error:
                    if error.code!='FILE_LIMIT':raise
                    capture.inspect_chain(path)
                    info=path.lstat()
                    state.setdefault('refused',[]).append({'path':str(path),'identity':[*capture.identity(info),info.st_size,info.st_mtime_ns,info.st_ctime_ns]})
                    problems.append('Aide indisponible (fichier non chargé): '+capture.display_path(path)+': '+str(error))
    bmad=found.folders.get('bmad')
    if bmad is not None:
        index=roots.index(str(bmad.parent));original=capture.long_path(req['roots'][index])/'bmad';receipt=state['roots'][index]
        for name in ('SKILL.md','references/help.md'):
            path=original/name;present=exists(path);state['optional'].append((str(path),present))
            if present:
                receipt['dirs'][path.parent.relative_to(Path(receipt['path'])).as_posix()]=capture.identity(path.parent.lstat())
                try:add(path,bmad/name,receipt)
                except capture.Refusal as error:
                    if error.code!='FILE_LIMIT':raise
                    capture.inspect_chain(path)
                    info=path.lstat()
                    state.setdefault('refused',[]).append({'path':str(path),'identity':[*capture.identity(info),info.st_size,info.st_mtime_ns,info.st_ctime_ns]})
                    problems.append('Aide indisponible (fichier non chargé): '+capture.display_path(path)+': '+str(error))

    knowledge_raw=native('knowledge',[a for r in roots for a in ('--root',r)]+['--content'])
    value=json.loads(knowledge_raw)
    ptarget=folder/'project';ptarget.mkdir();r=record(project)
    parsed=[]
    for rel in ('_bmad/config.toml','_bmad/custom/config.toml','_bmad/custom/config.user.toml'):
        p=project/rel;present=exists(p);state['optional'].append((str(p),present))
        try:parsed.append(tomllib.load(io.BytesIO(add(p,ptarget/rel,r))) if present else {})
        except (ValueError,UnicodeError) as e:problems.append('Configuration invalid: '+str(p)+': '+str(e));parsed.append({})
    import config_utils
    configuration_valid=not any(p.startswith('Configuration') for p in problems)
    try:config=config_utils.merge_layers(parsed)
    except config_utils.ConfigError as e:
        config={};configuration_valid=False;problems.append('Configuration structure invalid: '+str(e))
    core=config.get('core',{})
    if not isinstance(core,dict):
        core={};configuration_valid=False;problems.append('Configuration invalide: core doit être une table TOML.')
    output=None
    if configuration_valid:
        try:output=capture.confined_output(project,core.get('output_folder','{project-root}/_bmad-output'))
        except Exception as e:problems.append('Configuration output refused: '+str(e))
    active=core.get('active_initiative') if configuration_valid else None
    if active is not None and (not isinstance(active,str) or not active or Path(active).name!=active or any(c in active for c in '/\\:') or active in ('.','..')):problems.append('Contexte requis invalide: initiative active');active=None;context_valid=False
    inventories=[]
    def inv(p,all_names=False):
        names=listing(p,all_names);state['lists'].append((str(p),names,all_names));inventories.append(str(p)+': '+', '.join(names));return names
    def project_file(p):
        nonlocal context_valid
        try:
            raw=add(p,ptarget/p.relative_to(project),r)
            raw.decode('utf-8',errors='strict')
            return raw
        except (OSError,ValueError) as e:
            context_valid=False;problems.append('Contexte requis indisponible: '+str(p)+': '+str(e))
            return None
    output_present=False
    if output is not None:
        output_present=exists(output);state['optional'].append((str(output),output_present))
        if active and not output_present:
            context_valid=False;problems.append('Contexte requis indisponible: sortie absente pour initiative active '+active+': '+capture.display_path(output))
    if output_present:
        inv(output)
        if active:
            initiative=output/active
            if not exists(initiative):problems.append('Active initiative absent: '+str(initiative));context_valid=False
            else:
                inv(initiative);project_file(initiative/(active+'.md'))
                tickets=initiative/'tickets'
                if exists(tickets):
                    for name in inv(tickets):
                        epic=tickets/name.rstrip('/')
                        if not epic.name.startswith('epic-'):continue
                        project_file(epic/(epic.name+'.md'))
                        leaves=epic/'tickets'
                        if exists(leaves):
                            for name in inv(leaves,True):
                                p=leaves/name
                                if p.is_file() and p.suffix in ('.md','.toml'):project_file(p)
    config_present=exists(project/'_bmad/config.toml')
    state['legacy']=[legacy_presence(project/name) for name in LEGACY_MARKERS] if not config_present else []
    for marker in state['legacy']:
        if marker['present'] is True:problems.append('Marqueur ancien observé (présence seulement, contenu non lu): '+capture.display_path(marker['path']))
        elif marker['error']:problems.append('Présence ancienne indéterminée: '+capture.display_path(marker['path'])+': '+marker['error'])
    config_raw=''
    if config_present:
        if configuration_valid:
            try:config_raw=native('resolve_config',['--project-root',str(ptarget),'--key','core.output_folder','--key','core.active_initiative'])
            except Exception as e:problems.append('Configuration: '+str(e))
    else:problems.append('BMad configuration absent')
    sources=[]
    for original,snapshot,raw in mapping:
        try:text=raw.decode('utf-8',errors='strict')
        except UnicodeError:continue
        sources.append({'id':'source-'+str(len(sources)+1),'source':capture.display_path(original),'snapshot':snapshot,'sha256':capture.sha(raw),'bytes':len(raw),'text':text,'module':None,'skills':[]})
    documents=[]
    for d in value['documents']:
        path=next(str(Path(root)/d['reported_from']/d['path']) for root in roots if (Path(root)/d['reported_from']).exists())
        source=next(s for s in sources if s['snapshot']==path)
        documents.append({**source,'module':d['module'],'skills':d['skills']})
    skill=next((str(Path(root)/'bmad'/'SKILL.md') for root in roots if (Path(root)/'bmad'/'SKILL.md').exists()),str(folder/'unavailable'))
    qualified_skill=any(s['snapshot']==skill and s['sha256']=='f2ef6dad114db0723a583b04995198c52d51685b1076817f8d81c935c03833a7' for s in sources) and any(s['snapshot']==str(Path(skill).parent/'references/help.md') and s['sha256']=='77af962ca9efda75fb804e0a074d1f5e3d113863b77b59f1bdd80b13c3943369' for s in sources)
    if not qualified_skill:problems.append('Native bmad skill/help source not qualified for this profile')
    import knowledge
    scan=knowledge.scan([Path(r) for r in roots]);versions={m.table.get('version') for m in scan.modules}
    problems += [str(p) for p in value['problems']]
    installed={s['skill'] for s in value['skills']}
    for m in scan.modules:
        for member in m.skills:
            if member not in installed:problems.append(m.code+': missing '+member)
    if versions!={'6.13.0-next'}:problems.append('Native profile version not qualified: '+str(versions))
    state['copies']=[{k:s[k] for k in ('id','snapshot','sha256')} for s in sources]
    state['inventoriesDisplay']=inventories
    revision=capture.sha(json.dumps(state,sort_keys=True).encode())
    (folder/'capture.json').write_text(json.dumps(state),encoding='utf-8')
    hints=capture.observation_hints(state)
    fresh(folder)
    diagnostic=('legacy-observed' if any(m['present'] is True for m in state['legacy']) else 'unknown' if any(m['error'] for m in state['legacy']) else 'absent') if not config_present else 'unknown' if versions!={'6.13.0-next'} else 'partial' if problems else 'candidate-observed'
    return {'_observationHints':hints,'revision':revision,'diagnostic':diagnostic,'nativeReady':bool(documents and config_raw and qualified_skill and context_valid and output is not None and not any(p.startswith('Configuration') for p in problems) and versions=={'6.13.0-next'} and any(s['snapshot']==str(Path(skill).parent/'references/help.md') for s in sources)),'problems':problems,'documents':documents,'references':[{'module':v['module'],'path':v.get('file',v['path'])} for v in value['topics']+value['migrations']],'sources':sources,'activeInitiative':active,'selectedInitiative':None,'outputPath':capture.display_path(output) if output is not None else None,'inventories':inventories,'knowledgeRaw':knowledge_raw,'configRaw':config_raw,'skillPath':skill}


def context_observation(req,configuration_only=False):
    """Immediate G2 discovery from one bounded snapshot, never prepare/help."""
    import re
    import config_utils
    project=capture.long_path(req['project'])
    chain=capture.inspect_chain(project)
    root_identity=json.dumps(chain,separators=(',',':'))
    # Record identities for the project root/ancestors, not timestamps.
    root_identity=capture.sha(root_identity.encode())
    state={'roots':[],'lists':[],'optional':[],'fileIdentities':[]}
    problems=[];sources=[];total=0
    def record(root):
        item={'path':str(root),'exists':exists(root),'dirs':{},'files':{}}
        if item['exists']:item['dirs']['.']=list(capture.identity(root.lstat()))
        state['roots'].append(item)
        return item
    r=record(project)
    def read(p,receipt):
        nonlocal total
        source_identity=list(capture.identity(p.lstat()))
        raw=capture.read_safe(p,utf8=False);total+=len(raw)
        if list(capture.identity(p.lstat()))!=source_identity:raise ValueError('SOURCE_REPLACED')
        state['fileIdentities'].append({'path':str(p),'identity':source_identity})
        if total>16*1024*1024 or len(sources)>=2048:raise ValueError('CONTEXT_BOUND')
        rel=p.relative_to(Path(receipt['path'])).as_posix()
        receipt['files'][rel]=capture.sha(raw)
        for parent in p.parents:
            if not parent.is_relative_to(Path(receipt['path'])):break
            receipt['dirs'][parent.relative_to(Path(receipt['path'])).as_posix()]=list(capture.identity(parent.lstat()))
        sources.append({'path':capture.display_path(p),'sha256':capture.sha(raw)})
        return raw
    def optional(p):
        present=exists(p);state['optional'].append((str(p),present));return present
    def inventory(p):
        names=listing(p,True);state['lists'].append((str(p),names,True));return names
    layers=[];valid=True;config_present=False
    for rel in ('_bmad/config.toml','_bmad/custom/config.toml','_bmad/custom/config.user.toml'):
        p=project/rel;present=optional(p)
        if rel=='_bmad/config.toml':config_present=present
        try:layers.append(tomllib.load(io.BytesIO(read(p,r))) if present else {})
        except (ValueError,UnicodeError) as e:valid=False;layers.append({});problems.append(('Configuration refusée: '+capture.display_path(p)+': '+str(e))[:4000])
    try:config=config_utils.merge_layers(layers)
    except config_utils.ConfigError as e:config={};valid=False;problems.append(('Configuration refusée: '+str(e))[:4000])
    core=config.get('core',{})
    if not isinstance(core,dict):core={};valid=False;problems.append('Configuration core invalide.')
    active=core.get('active_initiative') if valid else None
    active_valid=active is None or isinstance(active,str) and bool(re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_-]{0,79}',active))
    if not active_valid:problems.append('Identifiant initiative active non représentable — contexte inconnu.')
    if not isinstance(active,str) or not active or len(active)>255:active=None
    output=None
    if valid and not configuration_only:
        try:
            configured=core.get('output_folder','{project-root}/_bmad-output')
            if isinstance(configured,str) and ':' in configured and not re.fullmatch(r'[A-Za-z]:[\\/][^:]*',configured):raise ValueError('OUTPUT_ADS')
            output=capture.confined_output(project,configured)
        except (ValueError,OSError) as e:valid=False;problems.append(('Sortie refusée: '+str(e))[:4000])
    versions=[];seen=set()
    for root_name in req['roots']:
        root=capture.long_path(root_name);receipt=record(root)
        if not receipt['exists']:continue
        for name in inventory(root):
            folder=root/name
            if not folder.is_dir():continue
            if name in seen:continue
            seen.add(name)
            receipt['dirs'][name]=list(capture.identity(folder.lstat()))
            manifest=folder/'bmod.toml'
            if not optional(manifest):continue
            table=tomllib.load(io.BytesIO(read(manifest,receipt)))
            module=table.get('bmod')
            if isinstance(module,dict):versions.append(module.get('version'))
    initiatives=[]
    if output is not None and optional(output):
        r['dirs'][output.relative_to(project).as_posix()]=list(capture.identity(output.lstat()))
        # Immediate folders and <name>/<name>.md only; no recursion or tickets.
        for name in inventory(output):
            folder=output/name
            if not folder.is_dir():continue
            r['dirs'][folder.relative_to(project).as_posix()]=list(capture.identity(folder.lstat()))
            source=folder/(name+'.md')
            if not optional(source):
                problems.append(('Source initiative absente: '+capture.display_path(source))[:4000]);continue
            raw=read(source,r)
            raw.decode('utf-8',errors='strict')
            identifier=name if re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_-]{0,79}',name) else None
            if identifier is None:problems.append(('Identifiant initiative non représentable: '+name)[:4000])
            initiatives.append({'id':identifier,'name':name,'path':capture.display_path(folder),'source':capture.display_path(source),'revision':capture.sha(raw)})
    if len(initiatives)>1024:raise ValueError('CONTEXT_BOUND')
    active_status='unknown' if not valid else 'absent' if active is None and active_valid else 'valid' if active_valid and (configuration_only or any(i['id']==active for i in initiatives)) else 'invalid'
    legacy=[legacy_presence(project/name) for name in LEGACY_MARKERS] if not config_present and not configuration_only else []
    state['legacy']=legacy
    status=('legacy-observed' if any(m['present'] is True for m in legacy) else 'absent') if not config_present else 'incompatible' if not valid else 'unknown' if not versions or set(versions)!={'6.13.0-next'} else 'partial' if problems else 'candidate-observed'
    # Receipt and resolution derive from exactly these captured bytes.
    revision=capture.sha(json.dumps(state,sort_keys=True).encode())
    folder=capture.long_path(req['folder'])
    (folder/'capture.json').write_text(json.dumps(state),encoding='utf-8')
    hints=capture.observation_hints(state)
    fresh(folder)
    if capture.inspect_chain(project)!=chain:raise ValueError('PROJECT_REPLACED')
    result={'_observationHints':hints,'rootIdentity':root_identity,'revision':revision,'status':status,'activeInitiative':active,'activeStatus':active_status,'sources':sources,'problems':problems}
    if not configuration_only:result['initiatives']=initiatives
    return result


def main():
    req=json.loads(capture.read_safe(Path(sys.argv[1]),file_limit=65536))
    manifest=json.loads(capture.read_safe(Path(__file__).parent/'runtime.json'))
    runtime_start=time.perf_counter()
    runtime_guard.closed_manifest(Path(sys.executable).parent,manifest['files'])
    runtime_ms=round((time.perf_counter()-runtime_start)*1000);globals()['NATIVE_RUNTIME_MS']=runtime_ms
    operation_start=time.perf_counter()
    def audit(event,args):
        if event.startswith('socket.') or event in ('subprocess.Popen','os.system','os.exec','os.posix_spawn'):raise ValueError('EFFECT_DENIED')
    sys.addaudithook(audit)
    if req['op'] in ('files-read','files-verify'):
        import files
        return files.operate(req)
    if req['op']=='catalog':
        import catalog
        return catalog.collect(req)
    if req['op']=='progress':
        import progress
        context=context_observation(req)
        result=progress.collect(req,context)
        fresh(capture.long_path(req['folder']))
        return result
    if req['op']=='context':return context_observation(req)
    if req['op']=='context-config':return context_observation(req,True)
    if req['op']=='prepare':return prepare(req)
    if req['op']=='fresh':return fresh(capture.long_path(req['prepared']))
    if req['op']=='read':
        folder=capture.long_path(req['prepared']);fresh(folder)
        state=json.loads(capture.read_safe(folder/'capture.json',file_limit=4*1024*1024))
        if req['reference']=='required-context':
            sources=[s for s in state['copies'] if '/skills-' not in s['snapshot'].replace('\\','/') or s['snapshot'].replace('\\','/').endswith('/bmad/references/help.md')]
            records=[]
            for source in sources:
                raw=capture.read_safe(Path(source['snapshot']))
                if capture.sha(raw)!=source['sha256']:raise ValueError('STALE_COPY')
                records.append({'id':source['id'],'sha256':source['sha256'],'text':raw.decode('utf-8')})
            return {'raw':json.dumps({'sources':records,'inventories':state['inventoriesDisplay']},ensure_ascii=False,separators=(',',':'))}
        if req['reference']=='inventories':return {'raw':'\n'.join(state['inventoriesDisplay'])}
        source=next((s for s in state['copies'] if s['id']==req['reference']),None)
        if source is None:raise ValueError('REFERENCE_NOT_ALLOWED')
        raw=capture.read_safe(Path(source['snapshot']))
        if capture.sha(raw)!=source['sha256']:raise ValueError('STALE_COPY')
        return {'raw':raw.decode('utf-8')}
    if req['op']=='native':
        folder=capture.long_path(req['prepared']);fresh(folder)
        if req['kind']=='knowledge':
            roots=sorted(folder.glob('skills-*'),key=lambda p:int(p.name.split('-')[1]))
            return {'raw':native('knowledge',[a for r in roots for a in ('--root',str(r))]+['--content'])}
        if req['kind']=='config':return {'raw':native('resolve_config',['--project-root',str(folder/'project'),'--key','core.output_folder','--key','core.active_initiative'])}
        raise ValueError('NATIVE_OPERATION')
    raise ValueError('OPERATION_NOT_ALLOWED')
if __name__=='__main__':
    try:
        start=time.perf_counter();result=main();result['_timings']={'worker_ms':round((time.perf_counter()-start)*1000),'runtime_guard_ms':globals().get('NATIVE_RUNTIME_MS')}
        raw=json.dumps(result,ensure_ascii=False).encode('utf-8')
        if len(raw)>4*1024*1024:raise ValueError('OUTPUT_LIMIT')
        sys.stdout.buffer.write(raw)
    except Exception as e:sys.stdout.buffer.write(json.dumps({'error':str(e)}).encode());raise SystemExit(1)
