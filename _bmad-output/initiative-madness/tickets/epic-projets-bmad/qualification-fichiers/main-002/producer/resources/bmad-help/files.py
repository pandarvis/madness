"""Private physical grants, issued only by native producers; no renderer paths."""
import json,stat
from pathlib import Path
import capture

TEXT_TYPES={'.md','.txt','.toml','.json','.yaml','.yml','.csv','.tsv','.py','.ts','.tsx','.js','.jsx','.mjs','.cjs','.css','.html','.htm','.svg','.xml','.sql','.c','.h','.cpp','.hpp','.rs','.go','.java','.cs','.rb','.sh','.ps1','.ini','.cfg','.log','.gitignore'}
def stamp(path):
    st=path.lstat()
    return [*capture.identity(st),st.st_size,st.st_mtime_ns,st.st_ctime_ns]
def record(path,source_id,raw):
    path=capture.long_path(path)
    return {'sourceId':source_id,'path':str(path),'sha256':capture.sha(raw),'bytes':len(raw),'chain':capture.inspect_chain(path),'stamp':stamp(path)}
def check(root,entry):
    path=capture.long_path(entry['path'])
    if not path.is_relative_to(root) or path==root:raise capture.Refusal('OUTSIDE_PROJECT')
    if json.dumps(capture.inspect_chain(path))!=json.dumps(entry['chain']) or stamp(path)!=entry['stamp']:raise capture.Refusal('REFERENCE_CHANGED')
    raw=capture.read_safe(path,utf8=False,expected=entry)
    if len(raw)!=entry['bytes'] or capture.sha(raw)!=entry['sha256'] or stamp(path)!=entry['stamp'] or json.dumps(capture.inspect_chain(path))!=json.dumps(entry['chain']):raise capture.Refusal('REFERENCE_CHANGED')
    return path,raw

def publish(folder,project,producer,revision,entries,initiative=None):
    project=capture.long_path(project);chain=capture.inspect_chain(project)
    entries=[e for e in entries if capture.long_path(e['path']).is_relative_to(project)]
    if len(entries)>2048 or len({e['sourceId'] for e in entries})!=len(entries):raise capture.Refusal('FILES_BOUND')
    state={'version':1,'project':str(project),'rootChain':chain,'rootIdentity':capture.sha(json.dumps(chain,separators=(',',':')).encode()),'producer':producer,'revision':revision,'initiativeId':initiative,'entries':entries}
    for entry in entries:check(project,entry)
    if capture.inspect_chain(project)!=chain:raise capture.Refusal('PROJECT_REPLACED')
    raw=json.dumps(state,ensure_ascii=False,separators=(',',':')).encode('utf-8')
    if len(raw)>4*1024*1024:raise capture.Refusal('FILES_BOUND')
    (capture.long_path(folder)/'files.json').write_bytes(raw)
    return {'producer':producer,'revision':revision,'rootIdentity':state['rootIdentity'],'initiativeId':initiative,'sources':[{'id':e['sourceId'],'path':capture.display_path(e['path']),'sha256':e['sha256'],'bytes':e['bytes']} for e in entries]}

def operate(req):
    raw=capture.read_safe(capture.long_path(req['prepared'])/'files.json',file_limit=4*1024*1024)
    if capture.sha(raw)!=req['receiptSha']:raise capture.Refusal('RECEIPT_CHANGED')
    state=json.loads(raw);root=capture.long_path(state['project'])
    if state['version']!=1 or state['producer']!=req['producer'] or state['revision']!=req['revision']:raise capture.Refusal('GRANT_CHANGED')
    if json.dumps(capture.inspect_chain(root))!=json.dumps(state['rootChain']):raise capture.Refusal('PROJECT_REPLACED')
    entry=next((e for e in state['entries'] if e['sourceId']==req['sourceId']),None)
    if entry is None:raise capture.Refusal('SOURCE_NOT_GRANTED')
    path,body=check(root,entry)
    result={'path':capture.display_path(path),'sha256':entry['sha256'],'bytes':entry['bytes']}
    if req['op']=='files-read':
        if path.suffix.lower() not in TEXT_TYPES and path.name not in ('LICENSE','README','Dockerfile','Makefile'):raise capture.Refusal('PREVIEW_TYPE')
        try:text=body.decode('utf-8',errors='strict')
        except UnicodeError:raise capture.Refusal('PREVIEW_UTF8') from None
        if '\x00' in text:raise capture.Refusal('PREVIEW_BINARY')
        result['text']=text
    if json.dumps(capture.inspect_chain(root))!=json.dumps(state['rootChain']):raise capture.Refusal('PROJECT_REPLACED')
    return result

def grant(folder,project,producer,revision,entries,initiative=None):
    """A receipt transport limit removes file actions, never the independent catalogue."""
    try:return publish(folder,project,producer,revision,entries,initiative)
    except capture.Refusal as error:
        if error.code!='FILES_BOUND':raise
        chain=capture.inspect_chain(capture.long_path(project))
        return {'producer':producer,'revision':revision,'rootIdentity':capture.sha(json.dumps(chain,separators=(',',':')).encode()),'initiativeId':initiative,'sources':[],'refusal':'Limite technique du reçu de fichiers — aperçu indisponible pour cette observation. Le catalogue et les preuves restent consultables.'}
