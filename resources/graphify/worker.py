"""Qualification worker: imports only the frozen closure, never fixture code.
Python audit hooks are observation/refusal controls, not an OS sandbox.
"""
import sys,os,json,hashlib,time,traceback,runpy,stat,subprocess,ctypes
from pathlib import Path
req=json.loads(Path(sys.argv[1]).read_text(encoding='utf-8-sig'))
m=json.loads(Path(req['assembly']).read_text(encoding='utf-8-sig'))
analysis=Path(req['analysis']).resolve();project=Path(req['project']).resolve()
packages=Path(req['resources'],'assembly/packages').resolve();runtime=Path(req['resources'],'assembly/runtime').resolve()
sys.path[:]=[str(runtime/'Lib'),str(runtime/'DLLs'),str(packages)]
events=[];phase='control-probes';busy=False

def inside(p,root):
    try:p.relative_to(root);return True
    except ValueError:return False

def record(event,detail):
    if len(events)<10000:events.append({'phase':phase,'event':event,'detail':detail})

def checked_path(value,write=False):
    if isinstance(value,int) or value is None:return
    raw=os.fsdecode(value)
    if raw.upper() in ('NUL','\\\\.\\NUL'):return
    if raw.startswith('\\\\?\\'):raw=raw[4:]
    p=Path(raw).resolve()
    allowed=[analysis] if write else [analysis,project,packages,runtime]
    if not any(inside(p,r) for r in allowed) and not (not write and str(p) in [x['path'] for x in req['harness']]):
        record('write-denied' if write else 'read-denied',str(p));raise PermissionError('OUTSIDE_SCOPE:'+str(p))
    if write and inside(p,project):record('write-denied',str(p));raise PermissionError('PROJECT_WRITE')
    # Reparse/hardlink protection supplements the path check. Resolve alone
    # would accept an in-root alias and lose the native reference provenance.
    for part in [p,*p.parents]:
        try:s=part.lstat()
        except FileNotFoundError:continue
        if getattr(s,'st_file_attributes',0)&0x400 or stat.S_ISLNK(s.st_mode):raise PermissionError('REFERENCE_LINK')
        if stat.S_ISREG(s.st_mode) and s.st_nlink!=1:raise PermissionError('REFERENCE_HARDLINK')

def audit(event,args):
    global busy
    if busy:return
    busy=True
    try:
        if event.startswith('socket.') and event not in ('socket.__new__','socket.gethostname'):record('network-denied',event);raise PermissionError('ANALYSIS_NETWORK_DENIED')
        if event=='open':
            mode=args[1];flags=args[2];write=(isinstance(mode,str) and any(c in mode for c in 'wax+')) or (isinstance(flags,int) and bool(flags&(os.O_WRONLY|os.O_RDWR|os.O_CREAT|os.O_TRUNC|os.O_APPEND)))
            checked_path(args[0],write)
        elif event in ('os.listdir','os.scandir'):checked_path(args[0])
        elif event in ('os.mkdir','os.remove','os.rmdir','os.unlink','os.chmod'):checked_path(args[0],True)
        elif event in ('os.rename','os.replace'):
            checked_path(args[0],True);checked_path(args[1],True)
        elif event in ('subprocess.Popen','_winapi.CreateProcess'):
            if not admitted_spawn:record('subprocess-denied',event);raise PermissionError('SUBPROCESS_DENIED')
        elif event in ('os.system','os.exec','os.posix_spawn','os.spawn','os.startfile'):record('subprocess-denied',event);raise PermissionError('SUBPROCESS_DENIED')
        elif event=='exec':
            filename=getattr(args[0],'co_filename','')
            if filename and not filename.startswith('<') and inside(Path(filename).resolve(),project):raise PermissionError('SOURCE_EXECUTION_DENIED')
    finally:busy=False

# Every subprocess is refused before Graphify can consult Git or project configuration.
admitted_spawn=False
def guarded_popen(args,*a,**kw):
    record('subprocess-denied',{'argv':list(args) if isinstance(args,(list,tuple)) else str(args)})
    raise PermissionError('SUBPROCESS_DENIED')
subprocess.Popen=guarded_popen
sys.addaudithook(audit)
started=time.monotonic();result={'case':'product-code-only','project':str(project),'analysis':str(analysis),'pid':os.getpid(),'parentPid':os.getppid(),'python':sys.version,'flags':{'isolated':sys.flags.isolated,'no_site':sys.flags.no_site,'bytecode':sys.dont_write_bytecode},'sys_path':sys.path[:],'env':dict(os.environ),'events':events}
try:
    import socket
    try:socket.socket().connect(('127.0.0.1',9))
    except PermissionError:result['network_probe_refused']=True
    try:subprocess.run(['unqualified-program'],check=True)
    except PermissionError:result['process_probe_refused']=True
    try:(project/'forbidden-write').write_text('forbidden')
    except PermissionError:result['write_probe_refused']=True
    phase='graphify'
    if req.get('pause_before_extract'):
        def profile_hook(frame,event,arg):
            if event=='call' and frame.f_code.co_name=='extract' and Path(frame.f_code.co_filename)==packages/'graphify/extract.py':
                sys.setprofile(None)
                (analysis/'ready').write_text(json.dumps({'phase':'extract-entry-before-parsing','files':len(frame.f_locals.get('paths',[]))}))
                while not (analysis/'continue').exists():time.sleep(.02)
        sys.setprofile(profile_hook)
    sys.argv=['graphify','extract',str(project),'--code-only','--max-workers','1','--out',str(analysis/'out')]+(['--no-cluster'] if req.get('raw') else [])
    result['argv']=sys.argv[:]
    try:runpy.run_module('graphify',run_name='__main__',alter_sys=True)
    except SystemExit as e:
        if e.code not in (None,0):raise
    result['outcome']='completed'
except BaseException as e:result.update(outcome='failed',error=type(e).__name__+':'+str(e),traceback=traceback.format_exc())
finally:
    phase='receipt'
    result['elapsed_ms']=round((time.monotonic()-started)*1000)
    class PMC(ctypes.Structure):_fields_=[('cb',ctypes.c_ulong),('faults',ctypes.c_ulong),('peakWorkingSet',ctypes.c_size_t),('workingSet',ctypes.c_size_t),('peakPagedPool',ctypes.c_size_t),('pagedPool',ctypes.c_size_t),('peakNonPagedPool',ctypes.c_size_t),('nonPagedPool',ctypes.c_size_t),('pagefile',ctypes.c_size_t),('peakPagefile',ctypes.c_size_t)]
    pm=PMC();pm.cb=ctypes.sizeof(pm)
    ctypes.windll.psapi.GetProcessMemoryInfo(ctypes.c_void_p(-1),ctypes.byref(pm),pm.cb)
    result['peakWorkingSetBytes']=pm.peakWorkingSet
    result['imports']=[{'name':n,'file':str(getattr(mod,'__file__',''))} for n,mod in list(sys.modules.items()) if getattr(mod,'__file__',None)]
    (analysis/'worker.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')


