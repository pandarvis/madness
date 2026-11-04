"""Owned witness matrix. Does not import witness modules or product code."""
import sys,os,json,tempfile,hashlib,subprocess,time,shutil,uuid,zipfile
from pathlib import Path
here=Path(__file__).resolve().parent
output=Path(sys.argv[1]).resolve();assembly=Path(sys.argv[2]).resolve()
m=json.loads(assembly.read_text(encoding='utf-8-sig'))
owner=Path(tempfile.mkdtemp(prefix='mgs41-'))
results=[]
def save(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2),encoding='utf-8')
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def snapshot(root):
    result={}
    def walk(p):
        for f in sorted(p.iterdir()):
            s=f.lstat();n=f.relative_to(root).as_posix()
            if getattr(s,'st_file_attributes',0)&0x400:result[n]={'reparse':True};continue
            if f.is_dir():walk(f)
            else:result[n]={'sha256':digest(f),'bytes':s.st_size}
    walk(root);return result

def corpus(root,variant='base'):
    root.mkdir(parents=True)
    files={
      'math_ops.py':'def add(a, b):\n    return a + b\n',
      'main.py':'from math_ops import add\n\ndef compute():\n    return add(1, 2)\n',
      'source-canary.py':"raise RuntimeError('FIXTURE_MUST_NOT_EXECUTE')\n",
      'web/util.js':'export function greet(name) { return "Hello " + name; }\n',
      'web/main.js':'import { greet } from "./util.js";\nexport function start() { return greet("Ada"); }\n',
      'typed/service.ts':'export class Service { act(): number { return 3; } }\n',
      'typed/client.ts':'import { Service } from "./service";\nexport function useService(): number { const service = new Service(); return service.act(); }\n',
      'typed/util.ts':'export function double(value: number): number { return value * 2; }\n',
      'typed/main.ts':'import { double } from "./util";\nexport function run(): number { return double(2); }\n',
      'dotnet/Math.cs':'namespace Demo { public class MathOps { public static int Add(int a, int b) { return a+b; } } }\n',
      'dotnet/Program.cs':'namespace Demo { public class Program { public static int Compute() { return MathOps.Add(1,2); } } }\n',
      'package.json':'{"name":"owned-witness","version":"1.0.0","dependencies":{"example-library":"1.2.3"},"scripts":{"prepare":"DO-NOT-RUN"}}\n',
      'AGENTS.md':'Canari témoin, ne pas exécuter.\n',
      '.claude/settings.json':'{"hooks":{"PreToolUse":[{"command":"DO-NOT-RUN"}]}}\n',
      '.agents/skills/witness/SKILL.md':'---\nname: witness\n---\nCanari.\n',
    }
    files.update({f'modules/module_{i:02}.py':f'def item_{i}():\n    return {i}\n' for i in range(20)})
    if variant=='git':files.update({'.gitignore':'ignored.py\n','ignored.py':'def ignored_symbol():\n    return 9\n','untracked.py':'def untracked_symbol():\n    return 7\n'})
    if variant=='config':files.update({'.graphifyrc':'{"ignore":["modules"]}\n','tsconfig.json':'{"compilerOptions":{"baseUrl":".","paths":{"@util/*":["typed/*"]}}}\n'})
    if variant=='valid-config':
        files['.graphifyrc']='language.tpl=typescript\nviz_node_limit=0\nGRAPHIFY_BACKEND=openai\nbackend=openai\nGRAPHIFY_OUT='+str(root.parent/'forbidden-outside')+'\nout='+str(root.parent/'forbidden-outside')+'\n'
        files['configured.tpl']='export function configuredOnly(): number { return 21; }\n'
    if variant=='outside-config':
        files['tsconfig.json']='{"extends":"../external-tsconfig.json"}\n'
        (root.parent/'external-tsconfig.json').write_text('{"compilerOptions":{"baseUrl":"OUTSIDE_CANARY"}}')
    if variant=='cpp':files['preprocessor.c']='#include <stdio.h>\n#define VALUE 1\nint main(void) {return VALUE;}\n'
    for n,s in files.items():p=root/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s,encoding='utf-8')
    if variant=='mixed':
        (root/'notes.pdf').write_bytes(b'%PDF-1.4\n% owned invalid PDF no model\n')
        for n in ['sheet.xlsx','paper.docx']:
            with zipfile.ZipFile(root/n,'w') as z:z.writestr('[Content_Types].xml','<Types/>')
        (root/'workspace.gdoc').write_text('{"url":"https://docs.google.com/document/d/owned-witness"}')
    if variant=='git':
        env={k:v for k,v in os.environ.items() if k.upper() in ('SYSTEMROOT','WINDIR','PATH','TEMP','TMP')}
        env.update(GIT_CONFIG_NOSYSTEM='1',GIT_CONFIG_GLOBAL='NUL',GIT_TERMINAL_PROMPT='0')
        for a in [['init',str(root)],['-C',str(root),'add','math_ops.py','main.py','.gitignore']]:subprocess.run([m['git']['path'],*a],env=env,check=True,capture_output=True)
        (root/'main.py').write_text('from math_ops import add\n\ndef compute_uncommitted():\n    return add(3, 4)\n')
    return root

harness=[{'path':str(p),'sha256':digest(p)} for p in [here/'worker.py',here/'runner.ps1',here/'preflight.ps1',here/'supervision.ps1']]

def execute(case,project=None,**options):
    selected=next((a.split('=',1)[1] for a in sys.argv[3:] if a.startswith('--case=')),None)
    if selected and case not in selected.split(','):return
    project=project or corpus(owner/(case+' projet é'))
    analysis=owner/('a-'+case);analysis.mkdir()
    for n in ['home','tmp','out']: (analysis/n).mkdir()
    legacy=None
    if options.get('inherited'):
        for n in ['.claude/skills/graphify/SKILL.md','.claude/plugins/graphify/plugin.json','.codex/skills/graphify/SKILL.md']:
            p=analysis/'home'/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_text('LEGACY_CANARY')
        # The inherited parent values must be absent/replaced in child env.
        os.environ['GRAPHIFY_OUT']=str(owner/'forbidden-outside')
        os.environ['GRAPHIFY_BACKEND']='openai'
        os.environ['OPENAI_API_KEY']='OWNED_FAKE_CANARY_NOT_A_CREDENTIAL'
        legacy=owner/'forbidden-outside';legacy.mkdir(exist_ok=True)
        (legacy/'legacy.md').write_text('# Sémantique historique témoin\n')
        old={'directed':False,'multigraph':False,'graph':{'schema_version':1,'graphify_version':'0.9.101'},'nodes':[{'id':'legacy_semantic','label':'LEGACY_SEMANTIC_MUST_NOT_MERGE','source_file':'legacy.md','source_location':None,'file_type':'document','_origin':'semantic','community':0}],'links':[],'hyperedges':[]}
        save(legacy/'graph.json',old)
    req={'case':case,'assembly':str(assembly),'analysis':str(analysis),'project':str(project),'timeout_ms':options.get('timeout_ms',120000),'harness':harness,**options}
    save(analysis/'request.json',req)
    if options.get('reuse_out'):(analysis/'out/graph.json').write_text('{"semantic":"MUST_NOT_MERGE"}')
    before=snapshot(project);home_before=snapshot(analysis/'home');legacy_before=snapshot(legacy) if legacy else None
    save(analysis/'source-before.json',before);save(analysis/'home-before.json',home_before)
    started=time.monotonic()
    proc=subprocess.Popen(['C:/Users/UP60066553/.pwsh-latest/pwsh.exe','-NoProfile','-File',str(here/'runner.ps1'),'-Request',str(analysis/'request.json')],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if options.get('pause_before_extract'):
        deadline=time.monotonic()+100
        while time.monotonic()<deadline and proc.poll() is None and not (analysis/'ready').exists():time.sleep(.05)
        if (analysis/'ready').exists():
            # Native process snapshot while the owned worker is paused, before
            # cancel/mutation. No new child process is created by this probe.
            import ctypes as c
            from ctypes import wintypes as w
            class PE(c.Structure):
                _fields_=[('size',w.DWORD),('usage',w.DWORD),('pid',w.DWORD),('heap',c.c_size_t),('module',w.DWORD),('threads',w.DWORD),('parent',w.DWORD),('priority',c.c_long),('flags',w.DWORD),('exe',w.WCHAR*260)]
            k=c.WinDLL('kernel32',use_last_error=True)
            k.CreateToolhelp32Snapshot.argtypes=[w.DWORD,w.DWORD];k.CreateToolhelp32Snapshot.restype=w.HANDLE
            k.Process32FirstW.argtypes=[w.HANDLE,c.POINTER(PE)];k.Process32NextW.argtypes=[w.HANDLE,c.POINTER(PE)];k.CloseHandle.argtypes=[w.HANDLE]
            handle=k.CreateToolhelp32Snapshot(2,0)
            if handle==c.c_void_p(-1).value:raise c.WinError(c.get_last_error())
            observed=[];entry=PE();entry.size=c.sizeof(entry)
            try:
                ok=k.Process32FirstW(handle,c.byref(entry))
                while ok:
                    observed.append({'pid':entry.pid,'parent':entry.parent,'exe':entry.exe})
                    ok=k.Process32NextW(handle,c.byref(entry))
            finally:k.CloseHandle(handle)
            execution=json.loads((analysis/'execution.json').read_text(encoding='utf-8-sig'));ids={execution['pid']}
            while True:
                added={v['pid'] for v in observed if v['parent'] in ids}-ids
                if not added:break
                ids.update(added)
            save(analysis/'native-processes.json',{'rootPid':execution['pid'],'phase':json.loads((analysis/'ready').read_text()),'processes':[v for v in observed if v['pid'] in ids],'limitation':'instantané Toolhelp32, pas trace exhaustive'})
            if options.get('mutate'):(project/'main.py').write_text('def mutated_during_analysis():\n    return 99\n')
            if options.get('cancel'):(analysis/'cancel').write_text('explicit-cancel')
            if not options.get('cancel') and not options.get('timeout_pause'):(analysis/'continue').write_text('continue')
    out,err=proc.communicate(timeout=160)
    (analysis/'launcher-stdout.log').write_bytes(out);(analysis/'launcher-stderr.log').write_bytes(err)
    after=snapshot(project);home_after=snapshot(analysis/'home');save(analysis/'source-after.json',after);save(analysis/'home-after.json',home_after)
    terminal=json.loads((analysis/'terminal.json').read_text(encoding='utf-8-sig'))
    worker=json.loads((analysis/'worker.json').read_text(encoding='utf-8-sig')) if (analysis/'worker.json').exists() else None
    artifacts=[]
    for p in (analysis/'out').rglob('*'):
        if p.is_file():artifacts.append({'name':p.relative_to(analysis/'out').as_posix(),'sha256':digest(p),'bytes':p.stat().st_size})
    row={'case':case,'analysis':str(analysis),'project':str(project),'options':options,'launcherExit':proc.returncode,'terminal':terminal,'duration_ms':round((time.monotonic()-started)*1000),'sourceUnchanged':before==after,'homeUnchanged':home_before==home_after,'before':before,'after':after,'artifacts':artifacts,'workerOutcome':worker.get('outcome') if worker else None,'workerError':worker.get('error') if worker else None,'fixtureSha256':digest(here/'fixtures.py'),'legacyBefore':legacy_before,'legacyAfter':snapshot(legacy) if legacy else None}
    results.append(row);save(output/'matrix.json',{'owner':str(owner),'assembly':str(assembly),'cases':results})
    dest=output/case;dest.mkdir()
    for n in ['execution.json','terminal.json','worker.json','runner-error.txt','stdout.log','stderr.log','request.json','source-before.json','source-after.json','home-before.json','home-after.json','launcher-stderr.log','ready','native-processes.json']:
        if (analysis/n).is_file():shutil.copyfile(analysis/n,dest/n)
    with zipfile.ZipFile(dest/'native-output.zip','w',compression=zipfile.ZIP_DEFLATED) as z:
        for item in artifacts:z.write(analysis/'out'/item['name'],item['name'])
    graph=analysis/'out/graphify-out/graph.json'
    if graph.exists():shutil.copyfile(graph,dest/'native-graph.json')
    # Versioned, expurgated fixture bytes, including noncommitted state.
    (dest/'corpus').mkdir()
    for n in after:
        p=project/n
        if not n.startswith('.git/') and p.is_file() and not getattr(p.lstat(),'st_file_attributes',0)&0x400:
            target=dest/'corpus'/n;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,target)
    print(case,row['workerOutcome'],row['workerError'],flush=True)
    return row

try:
    execute('G2-nominal')
    execute('G5-raw',raw=True)
    execute('G3-reused-output',reuse_out=True)
    execute('G3-inherited',inherited=True)
    for k in ['GRAPHIFY_OUT','GRAPHIFY_BACKEND','OPENAI_API_KEY']:os.environ.pop(k,None)
    for name in ['config','valid-config','git','mixed','outside-config','cpp']:execute('G4-'+name,corpus(owner/(name+' projet é'),name))
    # Native junction outside the root; no source through it is admitted.
    linked=corpus(owner/'linked projet é');outside=owner/'outside-canary';outside.mkdir();(outside/'secret.py').write_text('def outside_forbidden(): return 1\n')
    ps="New-Item -ItemType Junction -Path '"+str(linked/'external')+"' -Target '"+str(outside)+"' | Out-Null"
    subprocess.run(['C:/Users/UP60066553/.pwsh-latest/pwsh.exe','-NoProfile','-Command',ps],check=True,capture_output=True)
    execute('G4-link',linked)
    broken=corpus(owner/'broken projet é');(broken/'broken.sql').write_text('SELECT 1;\n');(broken/'invalid.py').write_text('def broken(:\n')
    execute('G8-incomplete',broken)
    beta=corpus(owner/'beta projet é');(beta/'math_ops.py').write_text('def beta_only():\n    return 88\n')
    execute('G6-beta',beta)
    execute('G6-mutation',pause_before_extract=True,mutate=True)
    execute('G7-cancel',pause_before_extract=True,cancel=True)
    execute('G7-timeout',pause_before_extract=True,timeout_pause=True,timeout_ms=45000)
    # Actual import closure alterations must fail before UV's first instruction.
    target=Path(m['owner'],'packages/graphify/__init__.py');original=target.read_bytes()
    for variant in ['missing','hash','extra']:
        extra=Path(m['owner'],'packages/unadmitted_import.py')
        try:
            if variant=='missing':target.unlink()
            elif variant=='hash':target.write_bytes(original+b'\n# changed\n')
            else:extra.write_text('raise RuntimeError("UNADMITTED")\n')
            execute('G1-'+variant)
        finally:
            target.write_bytes(original)
            if extra.exists():extra.unlink()
finally:
    save(output/'matrix.json',{'owner':str(owner),'assembly':str(assembly),'cases':results})
    # Retain all witnesses pending independent verification. No cleanup is
    # inferred from launcher exit; verify decides using each terminal/Job.
    print('retained',owner,flush=True)


