"""Closed owned CPython copy. No ambient bytecode, site package or path hook.

The 735 source/data records retain this explicitly qualified candidate's scope. They are the only
files copied, and every file/directory of the executable copy is inventoried.
This is a different guarantee from executing the original runtime with -B.
"""
import hashlib
import os
from pathlib import Path
import stat
import sys

TREE_PIN = 'f0a980c65dfb91e4a7fc3e49d92786ccf5636dd270f2d049738fd4df57298de8'
UV_PIN = '2bfbe53d3cc95799e98fa08323b04844fc01d4f8c87dd5c00089e43f6554f162'
NAMES = ['python.exe','python3.dll','python312.dll','vcruntime140.dll','vcruntime140_1.dll','DLLs','Lib']

def chain(path):
    for part in [*reversed(Path(path).parents), Path(path)]:
        st = part.lstat()
        if stat.S_ISLNK(st.st_mode) or getattr(st,'st_file_attributes',0) & 0x400:
            raise ValueError('RUNTIME_REPARSE')
        if stat.S_ISREG(st.st_mode) and st.st_nlink != 1:
            raise ValueError('RUNTIME_HARDLINK')
        if not (stat.S_ISREG(st.st_mode) or stat.S_ISDIR(st.st_mode)):
            raise ValueError('RUNTIME_TYPE')

def closed_manifest(root, expected_files):
    """Same closed policy as native preflight, repeated before every child UV."""
    root = Path(os.path.abspath(root))
    chain(root)
    for base in [root, root.parent]:
        if (base/'pyvenv.cfg').exists():
            raise ValueError('RUNTIME_VENV')
    expected = {r['name']:r['sha256'] for r in expected_files}
    dirs = {'Lib/site-packages'}
    for name in expected:
        if Path(name).is_absolute() or '..' in Path(name).parts or '\\' in name or ':' in name:
            raise ValueError('RUNTIME_RECORD')
        dirs.update(p.as_posix() for p in Path(name).parents if str(p) != '.')
    records, count = {}, 0
    def visit(path, depth):
        nonlocal count
        count += 1
        if count > 4096 or depth > 16:
            raise ValueError('RUNTIME_BOUND')
        # The root's complete ancestry was checked once; every descendant is
        # visited exactly once and each directory identity is checked again on
        # return. Re-statting all root ancestors for every file adds no new
        # covered byte, but exceeded the fixed child deadline under Windows.
        info = path.lstat()
        if stat.S_ISLNK(info.st_mode) or getattr(info,'st_file_attributes',0) & 0x400:
            raise ValueError('RUNTIME_REPARSE')
        if stat.S_ISREG(info.st_mode) and info.st_nlink != 1:
            raise ValueError('RUNTIME_HARDLINK')
        name = path.relative_to(root).as_posix()
        if stat.S_ISDIR(info.st_mode):
            if name not in dirs:
                raise ValueError('RUNTIME_EXTRA: '+name)
            for child in path.iterdir():
                visit(child,depth+1)
            final = path.lstat()
            if (info.st_ino,info.st_mtime_ns,info.st_ctime_ns) != (final.st_ino,final.st_mtime_ns,final.st_ctime_ns):
                raise ValueError('RUNTIME_CHANGED')
        else:
            if not stat.S_ISREG(info.st_mode):
                raise ValueError('RUNTIME_TYPE')
            if name not in expected:
                raise ValueError('RUNTIME_EXTRA: '+name)
            before = info
            raw = path.read_bytes()
            after = path.stat()
            if (before.st_ino,before.st_size,before.st_mtime_ns,before.st_ctime_ns) != (after.st_ino,after.st_size,after.st_mtime_ns,after.st_ctime_ns):
                raise ValueError('RUNTIME_CHANGED')
            value = hashlib.sha256(raw).hexdigest()
            if value != expected[name]:
                raise ValueError('RUNTIME_CHANGED: '+name)
            records[name] = value
    for path in root.iterdir():
        visit(path,0)
    if records != expected or not (root/'Lib/site-packages').is_dir():
        raise ValueError('RUNTIME_MISSING')
    fingerprint = hashlib.sha256(''.join(r['name']+':'+records[r['name']]+'\n' for r in expected_files).encode()).hexdigest()
    return {'root':str(root),'files':expected_files,'sha256':fingerprint,'policy':'closed-copy-v2'}

def filtered_env(cache):
    allowed = {'SYSTEMROOT','WINDIR','PATH'}
    cache = Path(cache)
    return {**{k:v for k,v in os.environ.items() if k.upper() in allowed},
            'UV_CACHE_DIR':str(cache), 'TEMP':str(cache/'tmp'), 'TMP':str(cache/'tmp')}

def isolated_state():
    return {'executable':sys.executable,'prefix':sys.prefix,'base_prefix':sys.base_prefix,
            'isolated':sys.flags.isolated,'no_site':sys.flags.no_site,
            'dont_write_bytecode':sys.dont_write_bytecode,'site_loaded':'site' in sys.modules,'sys_path':sys.path}


def native_run(command, raw_input, env, cwd, timeout, output_limit):
    """Per-call ownership before Resume; synchronous *available-only* pipe reads.

    No reader/writer thread, buffered pipe or unbounded wait/close. Stdin is a
    finite owned file (not a pipe), so a child that never reads cannot block us.
    Stop <=5s, drain <=3s and final root observation <=1s after the useful budget.
    All handles are unbuffered Win32 handles; close never waits for pipe EOF.
    """
    import ctypes as c
    from ctypes import wintypes as w
    import msvcrt
    import subprocess
    import tempfile
    import time
    class SA(c.Structure):
        _fields_=[('length',w.DWORD),('descriptor',w.LPVOID),('inherit',w.BOOL)]
    class SI(c.Structure):
        _fields_=[('cb',w.DWORD),('reserved',w.LPWSTR),('desktop',w.LPWSTR),('title',w.LPWSTR),
                  ('x',w.DWORD),('y',w.DWORD),('xsize',w.DWORD),('ysize',w.DWORD),('xchars',w.DWORD),('ychars',w.DWORD),
                  ('fill',w.DWORD),('flags',w.DWORD),('show',w.WORD),('reserved2',w.WORD),('reservedPtr',w.LPVOID),
                  ('input',w.HANDLE),('output',w.HANDLE),('error',w.HANDLE)]
    class PI(c.Structure):
        _fields_=[('process',w.HANDLE),('thread',w.HANDLE),('pid',w.DWORD),('tid',w.DWORD)]
    class BASIC(c.Structure):
        _fields_=[('processTime',c.c_longlong),('jobTime',c.c_longlong),('flags',w.DWORD),
                  ('minWorking',c.c_size_t),('maxWorking',c.c_size_t),('activeLimit',w.DWORD),
                  ('affinity',c.c_size_t),('priority',w.DWORD),('scheduling',w.DWORD)]
    class IOC(c.Structure):
        _fields_=[(n,c.c_ulonglong) for n in 'abcdef']
    class EXT(c.Structure):
        _fields_=[('basic',BASIC),('io',IOC),('processMemory',c.c_size_t),('jobMemory',c.c_size_t),
                  ('peakProcess',c.c_size_t),('peakJob',c.c_size_t)]
    class PIDLIST(c.Structure):
        _fields_=[('assigned',w.DWORD),('count',w.DWORD),('ids',c.c_size_t*128)]
    class ACCOUNT(c.Structure):
        _fields_=[(n,c.c_longlong) for n in 'abcd']+[(n,w.DWORD) for n in ['faults','total','active','terminated']]
    k=c.WinDLL('kernel32',use_last_error=True)
    def api(name,args,result=w.BOOL):
        fn=getattr(k,name);fn.argtypes=args;fn.restype=result;return fn
    job_new=api('CreateJobObjectW',[w.LPVOID,w.LPCWSTR],w.HANDLE)
    job_set=api('SetInformationJobObject',[w.HANDLE,c.c_int,w.LPVOID,w.DWORD])
    job_query=api('QueryInformationJobObject',[w.HANDLE,c.c_int,w.LPVOID,w.DWORD,w.LPVOID])
    assign=api('AssignProcessToJobObject',[w.HANDLE,w.HANDLE])
    stop=api('TerminateJobObject',[w.HANDLE,w.UINT])
    pipe=api('CreatePipe',[c.POINTER(w.HANDLE),c.POINTER(w.HANDLE),c.POINTER(SA),w.DWORD])
    inheritance=api('SetHandleInformation',[w.HANDLE,w.DWORD,w.DWORD])
    peek=api('PeekNamedPipe',[w.HANDLE,w.LPVOID,w.DWORD,w.LPVOID,c.POINTER(w.DWORD),w.LPVOID])
    read=api('ReadFile',[w.HANDLE,w.LPVOID,w.DWORD,c.POINTER(w.DWORD),w.LPVOID])
    create=api('CreateProcessW',[w.LPCWSTR,w.LPWSTR,w.LPVOID,w.LPVOID,w.BOOL,w.DWORD,w.LPVOID,w.LPCWSTR,c.POINTER(SI),c.POINTER(PI)])
    resume=api('ResumeThread',[w.HANDLE],w.DWORD)
    terminate=api('TerminateProcess',[w.HANDLE,w.UINT])
    wait=api('WaitForSingleObject',[w.HANDLE,w.DWORD],w.DWORD)
    exit_code=api('GetExitCodeProcess',[w.HANDLE,c.POINTER(w.DWORD)])
    close=api('CloseHandle',[w.HANDLE])
    current=api('GetCurrentProcess',[],w.HANDLE)
    is_in_job=api('IsProcessInJob',[w.HANDLE,w.HANDLE,c.POINTER(w.BOOL)])
    open_process=api('OpenProcess',[w.DWORD,w.BOOL,w.DWORD],w.HANDLE)
    duplicate=api('DuplicateHandle',[w.HANDLE,w.HANDLE,w.HANDLE,c.POINTER(w.HANDLE),w.DWORD,w.BOOL,w.DWORD])
    def require(ok):
        if not ok:raise c.WinError(c.get_last_error())
    handles=[]
    def own(h):
        if h:handles.append(h)
        return h
    def release(h):
        if h in handles:close(h);handles.remove(h)
    state={'policy':'job-before-resume-v5','outcome':'preparing','started':False,
           'job_assigned_before_resume':False,'stdin_mode':'owned-file','stdin_bytes':len(raw_input),
           'timeout_ms':round(timeout*1000),'stop_budget_ms':5000,'drain_budget_ms':3000,'return_budget_ms':1000}
    buffers=[bytearray(),bytearray()];ended=[False,False];overflow=False
    job=None;pi=PI();readers=[];input_file=None
    started=time.monotonic()
    try:
        # This owned cache belongs to the outer launcher before any inner call.
        temp=Path(env['TEMP']);chain(temp)
        input_file=tempfile.TemporaryFile(dir=temp)
        input_file.write(raw_input);input_file.seek(0)
        input_handle=w.HANDLE()
        require(duplicate(current(),msvcrt.get_osfhandle(input_file.fileno()),current(),c.byref(input_handle),0,True,2))
        own(input_handle.value)
        job=own(job_new(None,None));require(job)
        limits=EXT();limits.basic.flags=0x2000
        require(job_set(job,9,c.byref(limits),c.sizeof(limits)))
        sa=SA(c.sizeof(SA),None,True);writers=[]
        for _ in range(2):
            r,written=w.HANDLE(),w.HANDLE()
            require(pipe(c.byref(r),c.byref(written),c.byref(sa),0))
            readers.append(own(r.value));writers.append(own(written.value));require(inheritance(r,1,0))
        si=SI();si.cb=c.sizeof(SI);si.flags=0x100;si.input=input_handle;si.output=writers[0];si.error=writers[1]
        variables=c.create_unicode_buffer('\0'.join(key+'='+value for key,value in sorted(env.items(),key=lambda item:item[0].upper()))+'\0\0')
        args=c.create_unicode_buffer(subprocess.list2cmdline([str(arg) for arg in command]))
        require(create(str(command[0]),args,None,None,True,0x08000404,variables,str(cwd),c.byref(si),c.byref(pi)))
        own(pi.process);own(pi.thread);state.update(started=True,pid=pi.pid)
        require(assign(job,pi.process));state['job_assigned_before_resume']=True
        for h in [*writers,input_handle.value]:release(h)
        require(resume(pi.thread)!=0xffffffff);release(pi.thread)
        state['outcome']='running'
        def collect():
            nonlocal overflow
            for i,h in enumerate(readers):
                if ended[i]:continue
                available=w.DWORD()
                if not peek(h,None,0,None,c.byref(available),None):
                    if c.get_last_error()==109:ended[i]=True;continue
                    raise c.WinError(c.get_last_error())
                if not available.value:continue
                block=c.create_string_buffer(min(65536,available.value));n=w.DWORD()
                require(read(h,block,len(block),c.byref(n),None))
                room=output_limit-len(buffers[i]);buffers[i].extend(block.raw[:min(room,n.value)])
                if n.value>room:overflow=True
        deadline=started+timeout
        while True:
            collect()
            if overflow:state['outcome']='output-limit';break
            exited=wait(pi.process,0)==0
            if exited:
                state.setdefault('root_exit_ms',round((time.monotonic()-started)*1000))
                account=ACCOUNT();require(job_query(job,1,c.byref(account),c.sizeof(account),None))
                if account.active==0:state['outcome']='completed';break
            if time.monotonic()>=deadline:
                state['outcome']='descendants-stopped' if exited else 'timeout';break
            # The SAME useful budget covers the entire owned group. A signalled
            # root neither starts a grace timer nor releases its descendants.
            if exited:time.sleep(.005)
            else:wait(pi.process,10)
    except Exception as error:
        state['outcome']='supervision-error' if state['started'] else 'start-failed'
        state['error']=str(error)
    finally:
        if job:
            try:
                def active():
                    value=ACCOUNT();require(job_query(job,1,c.byref(value),c.sizeof(value),None));return value.active
                state['active_before_stop']=active()
                ids=PIDLIST()
                require(job_query(job,3,c.byref(ids),c.sizeof(ids),None))
                if ids.count>128:raise ValueError('JOB_PID_BOUND')
                state['live_before_stop']=[]
                # Accounting can still include already-signalled processes. No
                # grace period: observe each job PID exactly once, immediately.
                for pid in ids.ids[:ids.count]:
                    handle=open_process(0x101000,False,pid)
                    if not handle:
                        if c.get_last_error()==87:continue # no such process
                        raise c.WinError(c.get_last_error())
                    try:
                        member=w.BOOL();require(is_in_job(handle,job,c.byref(member)))
                        if not member.value:raise ValueError('JOB_PID_CHANGED')
                        status=wait(handle,0)
                        require(status in (0,258))
                        if status==258:state['live_before_stop'].append(pid)
                    finally:close(handle)
                if state['outcome']=='completed' and state['live_before_stop']:
                    state['outcome']='descendants-stopped'
            except Exception as error:state.update(outcome='stop-failed',observation_error=str(error))
            # Stop is independent of every observation error above.
            try:
                require(stop(job,1))
                # Assign failed while suspended: the root did not enter the job.
                if pi.process and not state['job_assigned_before_resume']:require(terminate(pi.process,1))
                clock=time.monotonic()
                while active() and time.monotonic()-clock<5:time.sleep(.01)
                state['job_active_after_stop']=active();state['stop_ms']=round((time.monotonic()-clock)*1000)
                if state['job_active_after_stop']:state['outcome']='stop-failed'
            except Exception as error:state.update(outcome='stop-failed',stop_error=str(error))
        drain=time.monotonic()
        try:
            if state['job_assigned_before_resume']:
                while not all(ended) and time.monotonic()-drain<3:
                    collect()
                    if not all(ended):time.sleep(.005)
                if not all(ended):state['outcome']='drain-timeout'
                elif overflow:state['outcome']='output-limit'
        except Exception as error:state.update(outcome='capture-failed',capture_error=str(error))
        state['drain_ms']=round((time.monotonic()-drain)*1000)
        if pi.process:
            try:
                if wait(pi.process,1000)==0:
                    code=w.DWORD();require(exit_code(pi.process,c.byref(code)))
                    state['exit']=c.c_int32(code.value).value
                else:state['outcome']='stop-failed'
            except Exception as error:state.update(outcome='stop-failed',return_error=str(error))
        for h in reversed(handles):close(h)
        if input_file:input_file.close()
        state['duration_ms']=round((time.monotonic()-started)*1000)
        for label,raw in zip(['stdout','stderr'],buffers):
            state[label+'_bytes']=len(raw);state[label+'_sha256']=hashlib.sha256(raw).hexdigest()
    return state,bytes(buffers[0]),bytes(buffers[1])
