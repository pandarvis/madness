import pathlib,subprocess,json,re,sys,hashlib,os
r=pathlib.Path(__file__).resolve().parents[3]
cp=r/"_bmad-output/initiative-madness/.working/sweep215-parent-state.json"
c=json.loads(cp.read_text(encoding="utf-8")); assert c.get("stage")=="step03-parent-verification-source-frozen",c.get("stage")
run=sys.argv[1] if len(sys.argv)>1 else "001"; assert re.fullmatch(r"[0-9]{3}",run)
q=r/"_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-sweep-projets"/f"parent-full-suite-{run}"; q.mkdir(exist_ok=True)
log=q/"tests.log"; assert not log.exists(),str(log)
files=sorted(str(p.relative_to(r)) for p in (r/"tests").glob("*.test.mjs"))
cmd=["node","--test","--test-concurrency=1","--test-reporter=spec",*files,"scripts/qualification/codex.test.mjs"]
(q/"runner.py").write_bytes(pathlib.Path(__file__).read_bytes())
(q/"command.json").write_bytes((json.dumps({"command":cmd,"cwd":str(r),"baseline":c["baseline"],"candidateVersion":json.loads((r/"package.json").read_text())["version"],"mode":"sequential; standard product Graph resources; runtime functional13 explicit without historical benchmark"},ensure_ascii=False,indent=2)+"\n").encode())
failures=[];counts={}; printed=set()
with log.open("wb") as out:
 env=dict(os.environ);env.pop("MADNESS_SWEEP_GRAPH_DIAGNOSTIC",None)
 proc=subprocess.Popen(cmd,cwd=r,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,creationflags=getattr(subprocess,"CREATE_NO_WINDOW",0))
 print(json.dumps({"startedPid":proc.pid,"log":str(log),"testFiles":len(files)+1}),flush=True)
 for line in iter(proc.stdout.readline,b""):
  out.write(line);out.flush();s=line.decode("utf-8",errors="replace").strip()
  if s.startswith("✖") and s not in printed:
   failures.append(s);printed.add(s);print(s,flush=True)
  m=re.fullmatch(r"ℹ (tests|suites|pass|fail|cancelled|skipped|todo) ([0-9]+)",s)
  if m:counts[m[1]]=int(m[2])
 code=proc.wait()
summary={"schemaVersion":1,"exitCode":code,"counts":counts,"failureLines":failures,"logSha256":hashlib.sha256(log.read_bytes()).hexdigest(),"fullRun":True,"baseline":c["baseline"],"sequential":True,"historical17NotRewritten":True,"humanNativeGatesNotImplied":True}
(q/"summary.json").write_bytes((json.dumps(summary,ensure_ascii=False,indent=2)+"\n").encode());print(json.dumps(summary,ensure_ascii=False),flush=True);sys.exit(code)
