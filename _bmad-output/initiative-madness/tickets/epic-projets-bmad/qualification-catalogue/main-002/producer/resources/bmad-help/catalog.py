"""Closed, read-only catalogue. Only pinned discovery code sees captured data."""
from __future__ import annotations
import json,re,stat,tomllib
from pathlib import Path
import capture,knowledge

NAME=re.compile(r'[A-Za-z0-9][A-Za-z0-9_-]{0,127}')

def scalar(value):
    value=value.strip()
    if not value:return None
    if value.startswith("'"):
        return value[1:-1].replace("''", "'") if re.fullmatch(r"'(?:[^']|'')*'",value) else None
    if value.startswith('"'):
        try:
            result=json.loads(value)
            return result if isinstance(result,str) else None
        except ValueError:return None
    if value[0] in '|>!&*[{#' or ' #' in value or ': ' in value:return None
    return value

def frontmatter(source):
    lines=source['text'].splitlines();fields={}
    if not lines or lines[0]!='---':return fields
    size=0
    for n,line in enumerate(lines[1:],2):
        size+=len(line.encode('utf-8'))+1
        if size>65536:return {}
        if line=='---':return fields
        match=re.fullmatch(r'(name|description):[ \t]*(.*)',line)
        if match:
            key,value=match.groups();value=scalar(value)
            # Duplicate/syntax-unknown declarations are unknown, never aliases.
            fields[key]=None if key in fields or value is None else {'sourceId':source['id'],'startLine':n,'endLine':n,'value':value}
    return {}

def help_fields(source,name):
    """Explicit table headings only; exact skill cells; fenced examples excluded."""
    result={};header=None;fence=None
    for n,line in enumerate(source['text'].splitlines(),1):
        stripped=line.strip()
        mark=re.match(r'(^`{3,}|^~{3,})',stripped)
        if mark:
            token=mark.group(1)[0]
            if fence is None:fence=token
            elif fence==token:fence=None
            header=None;continue
        if fence:continue
        if not stripped.startswith('|') or not stripped.endswith('|'):
            header=None;continue
        cells=[v.strip() for v in stripped[1:-1].split('|')]
        if all(re.fullmatch(r':?-{3,}:?',c) for c in cells):continue
        if 'Skill' in cells and ('For' in cells or 'Writes' in cells):header=cells;continue
        if not header or len(cells)!=len(header):continue
        cell=cells[header.index('Skill')]
        if cell not in (name,'`'+name+'`'):continue
        for heading,key in [('For','purpose'),('Writes','effects')]:
            if heading in header and cells[header.index(heading)]:
                result.setdefault(key,{'sourceId':source['id'],'startLine':n,'endLine':n,'value':cells[header.index(heading)]})
    return result

def collect(req):
    folder=capture.long_path(req['folder']);project=capture.long_path(req['project'])
    chain=capture.inspect_chain(project);capture.inspect_chain(folder)
    state={'roots':[],'lists':[],'optional':[],'fileIdentities':[],'refused':[]};sources=[];problems=[];total=0;entries=0
    winners={};staged=[];by_path={};unreadable=set()
    def issue(path,error):
        message=(capture.display_path(path)+': '+str(error))[:4000]
        problems.append(message)
        try:
            info=path.lstat();signature=[*capture.identity(info),info.st_size,info.st_mtime_ns,info.st_ctime_ns]
        except OSError:signature=None
        state['refused'].append({'path':str(path),'identity':signature});unreadable.add(str(path))
    def root_record(root):
        capture.inspect_chain(root,missing=True)
        present=root.exists();r={'path':str(root),'exists':present,'dirs':{},'files':{}}
        if present:r['dirs']['.']=list(capture.identity(root.lstat()))
        state['roots'].append(r);return r
    project_record=root_record(project)
    def inventory(path):
        nonlocal entries
        before=capture.inspect_chain(path)
        names=sorted(p.name for p in path.iterdir());entries+=len(names)
        if entries>8192:raise capture.Refusal('CATALOG_INVENTORY_BOUND')
        if capture.inspect_chain(path)!=before:raise capture.Refusal('CHANGED')
        state['lists'].append((str(path),names,True));return names
    def read(path,receipt,target=None):
        nonlocal total
        cached=by_path.get(str(path))
        if cached is not None:
            if target is not None:
                target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(cached['text'].encode('utf-8'))
            return cached
        capture.inspect_chain(path,missing=True)
        present=path.exists();state['optional'].append((str(path),present))
        if not present:return None
        before=list(capture.identity(path.lstat()))
        raw=capture.read_safe(path,utf8=False)
        if list(capture.identity(path.lstat()))!=before:raise capture.Refusal('SOURCE_REPLACED')
        total+=len(raw)
        if total>16*1024*1024 or len(sources)>=2048:raise capture.Refusal('CATALOG_CAPTURE_BOUND')
        receipt['files'][path.relative_to(Path(receipt['path'])).as_posix()]=capture.sha(raw)
        state['fileIdentities'].append({'path':str(path),'identity':before})
        for parent in path.parents:
            if not parent.is_relative_to(Path(receipt['path'])):break
            receipt['dirs'][parent.relative_to(Path(receipt['path'])).as_posix()]=list(capture.identity(parent.lstat()))
        if target is not None:target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(raw)
        text=raw.decode('utf-8',errors='strict')
        if '\x00' in text:raise capture.Refusal('TEXT_NUL')
        s={'id':'catalog-source-'+str(len(sources)+1),'path':capture.display_path(path),'sha256':capture.sha(raw),'bytes':len(raw),'text':text}
        sources.append(s);by_path[str(path)]=s;return s
    for index,root_name in enumerate(req['roots']):
        root=capture.long_path(root_name);stage=folder/('catalog-skills-'+str(index));stage.mkdir();staged.append(stage)
        try:r=root_record(root)
        except (ValueError,OSError) as e:issue(root,e);break
        if not r['exists']:continue
        try:names=inventory(root)
        except (ValueError,OSError) as e:issue(root,e);break
        for name in names:
            path=root/name
            try:info=path.lstat()
            except OSError as e:issue(path,e);continue
            # Reparse directory names still shadow user copies without following them.
            if not stat.S_ISDIR(info.st_mode) and not getattr(info,'st_file_attributes',0)&0x400 and not stat.S_ISLNK(info.st_mode):continue
            if name in winners:continue
            winners[name]=(path,r,index);(stage/name).mkdir()
            try:
                capture.inspect_chain(path);r['dirs'][name]=list(capture.identity(info))
                read(path/'bmod.toml',r,stage/name/'bmod.toml')
            except (ValueError,OSError,UnicodeError) as e:
                issue(path/'bmod.toml',e)
                # Invalid UTF8 must not be fed to the canonical TOML parser.
                staged_manifest=stage/name/'bmod.toml'
                if staged_manifest.exists():staged_manifest.unlink()
    found=knowledge.scan(staged);problems.extend(str(p) for p in found.problems)
    modules=[];documents=[]
    for m in found.modules:
        original,r,index=winners[m.folder.name]
        modules.append({'code':m.code,'folder':m.folder.name,'version':m.table.get('version') if isinstance(m.table.get('version'),str) else None,'sourceId':by_path[str(original/'bmod.toml')]['id']})
        selected={'help/help.md'}
        for entry in m.table.get('knowledge',[]) if isinstance(m.table.get('knowledge',[]),list) else []:
            if isinstance(entry,dict) and isinstance(entry.get('path'),str) and knowledge.safe_skill_relative(entry['path']) is not None:selected.add(entry['path'])
        for relative in sorted(selected):
            try:read(original/relative,r,m.folder/relative)
            except (ValueError,OSError,UnicodeError) as e:issue(original/relative,e)
    # Canonical coverage associations, computed on the closed safe snapshot.
    discovered=knowledge.collect(staged,include_content=False);problems.extend(str(p) for p in discovered['problems'])
    for d in discovered['documents']:
        original,_,_=winners[d['reported_from']];source=by_path.get(str(original/d['path']))
        if source:documents.append((d,source))
    installed={s['skill']:s for s in found.skills};items=[]
    for m in found.modules:
        for name in m.skills:
            member=installed.get(name)
            if member is None:problems.append(m.code+': missing registered skill '+name)
            elif member['bmod']!=m.folder.name:problems.append(m.code+': contradictory membership '+name)
        required=m.table.get('required_skills',[])
        if not isinstance(required,list):problems.append(m.code+': invalid required_skills')
        else:
            for dependency in required:
                name=dependency.get('skill') if isinstance(dependency,dict) else dependency
                if not isinstance(name,str) or name not in installed:problems.append(m.code+': missing dependency '+str(name))
    for name,(path,r,index) in winners.items():
        entry=installed.get(name)
        source=None
        if entry is None:
            try:
                capture.inspect_chain(path/'SKILL.md',missing=True)
                present=(path/'SKILL.md').exists();state['optional'].append((str(path/'SKILL.md'),present))
                if present:problems.append(capture.display_path(path)+': SKILL without BMad skill record (not a host capability)')
            except (ValueError,OSError) as e:issue(path/'SKILL.md',e)
            continue
        try:source=read(path/'SKILL.md',r)
        except (ValueError,OSError,UnicodeError) as e:issue(path/'SKILL.md',e)
        m=next((m for m in found.modules if m.folder.name==entry['bmod']),None)
        reasons=[]
        if not source:reasons.append('SKILL source missing or refused')
        if m is None or name not in m.skills:reasons.append('Reciprocal module membership not established')
        fm=frontmatter(source) if source else {}
        if not fm.get('name') or fm['name']['value']!=name:reasons.append('Exact SKILL name does not match winning folder')
        if not NAME.fullmatch(name):reasons.append('Folder name has no qualified exact invocation')
        purpose=fm.get('description');effects=None;documentation=[]
        for d,s in documents:
            if name in d['skills'] and m is not None and d['module']==m.code:
                values=help_fields(s,name);purpose=purpose or values.get('purpose');effects=effects or values.get('effects');documentation.extend(values.values())
        if source and not purpose:problems.append(name+': purpose syntax absent or unknown')
        items.append({'id':name,'name':name,'module':entry['module'],'sourceId':source['id'] if source else None,'manifestSourceId':by_path[str(path/'bmod.toml')]['id'],'invocation':'$'+name if not reasons else None,'presence':'present' if source else 'unavailable','copyable':not reasons,'copyReasons':reasons,'documentation':documentation,'launchable':False,'launchReason':'General launch is not qualified for this profile','fields':{'purpose':purpose,'inputs':None,'conditions':None,'effects':effects}})
    if capture.inspect_chain(project)!=chain:raise capture.Refusal('PROJECT_REPLACED')
    # Recheck every accepted input, directory, absence and refused identity.
    for r in state['roots']:
        p=Path(r['path']);capture.inspect_chain(p,missing=True)
        if p.exists()!=r['exists']:raise capture.Refusal('STALE_ROOT')
        for rel,ident in r['dirs'].items():
            q=p/rel
            if list(capture.identity(q.lstat()))!=ident or capture.inspect_chain(q) is None:raise capture.Refusal('CHANGED')
        for rel,digest in r['files'].items():
            if capture.sha(capture.read_safe(p/rel,utf8=False))!=digest:raise capture.Refusal('CHANGED')
    for p,names,_ in list(state['lists']):
        if sorted(q.name for q in Path(p).iterdir())!=names:raise capture.Refusal('CHANGED')
    for p,present in state['optional']:
        if str(p) not in unreadable and Path(p).exists()!=present:raise capture.Refusal('CHANGED')
    for source in state['fileIdentities']:
        if list(capture.identity(Path(source['path']).lstat()))!=source['identity']:raise capture.Refusal('CHANGED')
    for source in state['refused']:
        try:
            info=Path(source['path']).lstat();signature=[*capture.identity(info),info.st_size,info.st_mtime_ns,info.st_ctime_ns]
        except OSError:signature=None
        if signature!=source['identity']:raise capture.Refusal('CHANGED')
    revision=capture.sha(json.dumps(state,sort_keys=True).encode());(folder/'capture.json').write_text(json.dumps(state),encoding='utf-8')
    hints=capture.observation_hints(state)
    versions={m['version'] for m in modules}
    diagnostic='absent' if not modules and not items and not problems else 'unknown' if versions!={'6.13.0-next'} else 'partial' if problems else 'candidate-observed'
    return {'rootIdentity':capture.sha(json.dumps(chain,separators=(',',':')).encode()),'revision':revision,'diagnostic':diagnostic,'coverage':'partial' if problems else 'complete','roots':[capture.display_path(r) for r in req['roots']],'sources':sources,'modules':modules,'items':sorted(items,key=lambda i:i['name']),'problems':list(dict.fromkeys(problems)),'_observationHints':hints}
