"""Closed verifier. Only --seal and --promote write, both explicit create-only."""
import argparse
import json
import io
import re
from pathlib import Path
import fixtures
import prototype as p
import evidence

CODE = ['prototype.py','fixtures.py','scenarios.py','runtime_guard.py','evidence.py','verify.py','run.ps1','runtime-preflight.ps1','preflight-probe.ps1','sources-lock.json']
LEGACY_CODE = list(CODE)
DATA = ['results.json','inventory-local.json','context-local.json','tickets-local.json','tickets-conflict.json','scenarios.log','calls.log']

def resolve_run(name):
    if not isinstance(name,str) or not re.fullmatch(r'run-[a-f0-9]{32}',name):
        raise ValueError('RUN_ID')
    path = p.HERE / 'runs' / name
    p.inspect_chain(path)
    return path

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--run')
    parser.add_argument('--seal', action='store_true')
    parser.add_argument('--promote', action='store_true')
    args = parser.parse_args()
    selected = p.HERE / 'selected-run.json'
    name = args.run or json.loads(p.read_safe(selected))['run']
    run = resolve_run(name)
    captured = evidence.snapshot(run)
    def raw(name):
        evidence.allowed(name)
        return captured[name]
    def text(name):
        return raw(name).decode('utf-8')
    def value(name):
        return json.loads(raw(name))
    def digest(name):
        return p.sha(raw(name))
    checks = []
    def check(label, condition):
        checks.append({'check':label,'passed':bool(condition)})
        if not condition:
            raise AssertionError(label)
    lock = p.check_lock()
    execution = value('execution.json') if ('execution.json' in captured) else None
    if execution:
        expected_owned = {str(p.HERE/name) for name in ['fixtures-runtime-owned','fixtures-uv-cache','fixtures-run-'+run.name[4:]]}
        if not isinstance(execution.get('owned'),list) or not set(execution['owned']).issubset(expected_owned):
            raise p.Refusal('EVIDENCE_OWNERSHIP')
        if any(c.get('path') not in expected_owned for c in execution.get('cleanup',[])):
            raise p.Refusal('EVIDENCE_OWNERSHIP')
    if execution and (execution['outcome'] != 'completed' or execution['exit'] != 0 or not ('results.json' in captured)):
        if args.seal or args.promote:
            raise ValueError('INCOMPLETE_NOT_QUALIFIED')
        snapshots = value('sources-lock.json') if ('sources-lock.json' in captured) else None
        available = {name:p.sha(raw) for name,raw in captured.items()}
        if snapshots:
            for item, expected in snapshots.get('bench',{}).items():
                if item in available and available[item] != expected:
                    raise ValueError('INCOMPLETE_CODE_CHANGED')
        check('owned cleanup recorded',bool(execution['cleanup']) and all(c['removed'] for c in execution['cleanup']))
        check('owned cleanup observed',all(not Path(value).exists() for value in execution['owned'] if Path(value).name.startswith('fixtures-run-')))
        print(json.dumps({'checks':len(checks),'passed':len(checks),'run':run.name,
                          'execution_outcome':execution['outcome'],'results_present':('results.json' in captured),
                          'available_sha256':available,'current_qualification':False,'incomplete':True},indent=2))
        return
    # Failed/targeted historical attempts have no seal. They remain inspectable,
    # never newly sealed or promoted by the current policy.
    if not execution and not ('evidence-manifest.json' in captured):
        if args.seal or args.promote:
            raise ValueError('HISTORICAL_UNSEALED_NOT_CURRENT')
        available = {name:p.sha(raw) for name,raw in captured.items()}
        result = value('results.json') if ('results.json' in captured) else None
        print(json.dumps({'run':run.name,'incomplete':True,'historical_receipt':True,
                          'current_qualification':False,'tests':result.get('tests') if result else None,
                          'available_sha256':available},indent=2))
        return
    run_lock = value('sources-lock.json')
    schema = run_lock.get('schema',1)
    historical = schema < 4 or run_lock.get('bench') != lock.get('bench')
    code = [n for n in LEGACY_CODE if n not in {'runtime-preflight.ps1','preflight-probe.ps1'}] if schema == 1 else LEGACY_CODE if schema == 2 else [*run_lock['bench'],'sources-lock.json']
    data_names = DATA if schema < 3 else DATA+['execution.json','launcher.stdout.log','launcher.stderr.log','supervision-probe.stdout.log','supervision-probe.stderr.log']
    preview = value('results.json') if ('results.json' in captured) else None
    partial = not preview or preview.get('tests') != {'run':15,'passed':15,'failures':0,'errors':0,'skipped':0}
    if (partial or historical) and schema >= 3 and not ('evidence-manifest.json' in captured):
        if args.seal or args.promote:
            raise ValueError('UNQUALIFIED_NOT_SEALABLE')
        for item, expected in run_lock['bench'].items():
            check('snapshot '+item,digest(item)==expected)
        print(json.dumps({'run':run.name,'incomplete':partial,'historical_receipt':historical,
                          'current_qualification':False,'tests':preview.get('tests') if preview else None,
                          'available_sha256':{name:p.sha(raw) for name,raw in captured.items()}},indent=2))
        return
    if args.seal or args.promote:
        check('current policy required for new seal/promotion',not historical)
    for name in code + data_names:
        check('artifact '+name, name in captured)
    for name in code:
        # A read-only historical verification checks the sealed copy, not the
        # current revision of a harness that has legitimately evolved.
        check('executed code/pins preserved '+name, name in captured and (not (args.seal or args.promote) or digest(name)==evidence.digest(p.HERE/name)))
    results = value('results.json')
    check('15 tests without skips', results['tests']=={'run':15,'passed':15,'failures':0,'errors':0,'skipped':0})
    check('complete unique matrix', len(results['matrix'])==15 and {m['id'] for m in results['matrix']}=={'M'+str(i) for i in range(1,16)})
    check('assertions on every row', all(m['passed'] and m['assertions']>0 for m in results['matrix']))
    log = text('scenarios.log')
    for i in range(1,16):
        check('executed M'+str(i), any(line.startswith('test_M'+str(i)+'_') and line.endswith(' ... ok') for line in log.splitlines()))
    check('observations separate', {o['case'] for o in results['observations']}=={'M'+str(i) for i in range(1,16)})
    check('actual Windows boundaries', results['platform'].startswith('Windows-') and any(o['case']=='M10' and o['data']['ancestor'] in {'HANDLE_REDIRECTED','REPARSE','CHANGED'} for o in results['observations']))
    check('all cleanup', len(results['cleanup'])==15 and all(c['removed'] for c in results['cleanup']))
    check('no owned fixture remains', not list(p.HERE.glob('fixtures-run-*')))
    check('preservation before/after exact', results['preservation']['unchanged'] and results['preservation']['before']==results['preservation']['after']==lock['preservation_before'])
    check('current product/managed/config exact', fixtures.preservation()==lock['preservation_before'])
    check('paired scripts exact', all(c['identical'] and evidence.digest(Path(c['source']))==evidence.digest(Path(c['copy']))==c['sha256'] for c in lock['copies']))
    check('no ordinary effect attempted', all(not c['denied_effects'] for c in results['calls'] if c['op']!='audit-probe'))
    check('deliberate audit probes refused', any(set(c['denied_effects'])=={'socket.__new__','write'} for c in results['calls'] if c['op']=='audit-probe'))
    calls = [json.loads(s) for s in text('calls.log').splitlines()]
    check('bounded managed calls', all(c['stdout_bytes']<=p.OUTPUT_LIMIT and c['stderr_bytes']<=p.OUTPUT_LIMIT and c['duration_ms']<p.TIME_LIMIT*1000 for c in calls))
    check('uv offline/no config, isolated base every ordinary call', all(all(flag in c['argv'] for flag in ['--offline','--no-project','--no-config','-I','-S','-B']) and (c['op']=='runtime-inspection-probe' or str(Path(run_lock['runtime']['root'])/'python.exe') in c['argv']) for c in calls))
    state = results['runtime_state']
    check('entry launcher isolated base', state['isolated']==1 and state['no_site']==1 and state['dont_write_bytecode'] and not state['site_loaded'] and state['prefix']==state['base_prefix'])
    inventory = value('inventory-local.json')
    check('exact local preview', len(inventory['modules'])==3 and {m['table']['version'] for m in inventory['modules']}=={'6.13.0-next'})
    check('partial not promoted', inventory['profile']=='partial' and all(s['launch']=='unqualified' for s in inventory['skills']))
    check('17 TOML entries no leaves', len(inventory['tickets'])==17 and all(t['file'] is None for t in inventory['tickets']))
    context = value('context-local.json')['receipt']
    check('distinct bounded context receipt', context['kind']==('context-v1' if schema == 1 else 'context-v2') and context['bytes']<=p.TOTAL_LIMIT and context['revision']!=inventory['source_revision'])
    check('context raw bytes match fingerprints', all(p.sha(v['raw'].encode())==v['sha256'] for v in context['files'].values()))
    conflict = value('tickets-conflict.json')
    check('leaf and plan statuses independently retained', conflict['sources']['leaves'][0]['fields']['status']=='done' and conflict['sources']['plans'][1]['fields']['status']=='in-progress')
    check('tracker and entry retained', conflict['sources']['trackers'][0]['fields']['tracker_status']=='done' and len(conflict['sources']['entries'])==2)
    check('ticket raw sources match hashes', all(p.sha(s['content'].encode())==s['sha256'] for s in conflict['sources']['files']))
    check('six counterexamples executed', len(results['observations'])>=20)
    if schema >= 2:
        check('context derives exactly from captured layers',p.load_tool('config_utils').merge_layers([p.tomllib.load(io.BytesIO(context['files'][rel]['raw'].encode('utf-8'))) if rel in context['files'] else {} for rel in context['resolution']['layers']])==context['resolved_config'])
        check('alpha beta mutation exercised',any(o['case']=='M12' and o['data'].get('stale_resolution')=='CONFIG_RESOLUTION_MISMATCH' and o['data'].get('skills_unchanged') for o in results['observations']))
        startup = next(o['data'] for o in results['observations'] if o['case']=='M15' and o['data'].get('closed_runtime_verified'))
        check('uv closed startup probe observed',startup['actual_uv_probe'] and startup['no_fixture_hook_executed'] and startup['native_first_launch_guard_exercised'])
        check('all new executable variants refused before launch',len(startup['refused_variants'])==14 and all(v['native_refused'] and v['probe_refused'] and not v['launched'] for v in startup['refused_variants']))
        check('closed allowed set pinned',lock['runtime']['policy']=='closed-copy-v2' and lock['startup']['allowed_files']==734)
    if not historical:
        check('worker source closures tied to receipt',all(c.get('bench_execution') and c['bench_execution']['sha256']==p.bench_manifest(run_lock) and c['bench_execution']['bootstrap_sha256']==run_lock['bench']['source_bootstrap.py'] for c in calls if c['op'] not in {'runtime-inspection-probe','bench-source-probe'}))
        check('schema4 results and terminal launcher',results['schema']==4 and execution['schema']==4 and execution['outcome']=='completed' and execution['exit']==0)
        check('parent cleanup complete',bool(execution['cleanup']) and all(c['removed'] for c in execution['cleanup']))
        check('entry source closure tied to receipt',results['bench_execution']['policy']=='captured-source-only-v4' and results['bench_execution']['sha256']==p.bench_manifest(run_lock) and results['bench_execution']['bootstrap_sha256']==run_lock['bench']['source_bootstrap.py'])
        check('native stdout log really captured',len(raw('launcher.stdout.log'))>0 and 'NEW_RUN: '+run.name in text('launcher.stdout.log'))
        check('Windows encoding variants retain independent fields',len(conflict['encoding_variants'])==3 and all(v['proof']['sources']['leaves'][0]['fields']['status']=='done' and v['proof']['sources']['plans'][1]['fields']['status']=='in-progress' for v in conflict['encoding_variants']))
        check('Windows raw bytes match original fingerprints',all(p.sha(s['content'].encode('utf-8'))==s['sha256'] for v in conflict['encoding_variants'] for s in v['proof']['sources']['files']))
        imports = next(o['data'] for o in results['observations'] if o['case']=='M15' and o['data'].get('source_only'))
        check('source-only adversarial harness formats exercised',len(imports['ignored_variants'])==8 and imports['changed_source_refused'] and imports['sha256']==p.bench_manifest(run_lock))
        supervision = next(o['data'] for o in results['observations'] if o['case']=='M15' and 'forced' in o['data'])
        check('real forced stop after child fixture observed',supervision['forced']['outcome']=='timeout' and supervision['forced']['marker_observed'] and not supervision['forced']['results_present'])
        check('failed start and next run observed',supervision['failed_start']['outcome']=='start-failed' and supervision['next']['outcome']=='completed' and supervision['next']['exit']==0)
        check('forced and failed resources removed',all(c['removed'] for n in ['forced','next','failed_start'] for c in supervision[n]['cleanup']))
    if not historical:
        check('native job assigned before every launcher instruction',execution['job_assigned_before_resume'] and execution['job_active_after_stop']==0 and execution['drain_ms']<4000)
        check('root exit leaves no owned descendant',supervision['orphan']['outcome']=='descendants-stopped' and supervision['orphan']['exit']==0 and supervision['orphan']['active_before_stop']>0 and supervision['orphan']['job_active_after_stop']==0 and supervision['child_stopped'])
        check('inherited pipe return and cleanup finite',supervision['orphan']['elapsed_ms']<25000 and supervision['orphan']['drain_ms']<4000 and all(c['removed'] for c in supervision['orphan']['cleanup']))
        central=next(o['data']['central_encodings'] for o in results['observations'] if 'central_encodings' in o['data'])
        check('binary central semantics match native',[(c['encoding'],c['native_accepted'],c['profile_accepted']) for c in central]==[('lf',True,True),('crlf',True,True),('bom',False,False),('bare-cr',False,False)])
        readers=next(o['data'] for o in results['observations'] if 'invalid_records' in o['data'])
        check('all receipt policies refuse external field names',len(readers['invalid_records'])==32 and all(c['refusal']=='EVIDENCE_NAME' for c in readers['invalid_records']) and readers['size_and_ntfs_refused'] and readers['external_unchanged'])
        check('prior healthy and incomplete receipts remain readable',len(readers['historical_runs'])>=18)
        destinations=next(o['data']['destinations'] for o in results['observations'] if 'destinations' in o['data'])
        check('both write destinations refuse pre-existing junctions',{c['folder'] for c in destinations}=={'runs','logs'} and all(c['refused_before_uv'] and c['outside_unchanged'] for c in destinations))
    if args.seal:
        evidence.seal(run, code+data_names)
        captured = evidence.snapshot(run)
    manifest = evidence.verify(run,captured)
    check('all required evidence sealed', set(manifest['sha256'])==set(code+data_names))
    if args.promote:
        if args.seal:
            raise ValueError('SEPARATE_SEAL_AND_PROMOTION')
        # Explicit promotion has its own create-only record; selection is the
        # single replaceable pointer, never an execution receipt or a seal.
        promotion = p.HERE / ('promotion-'+run.name+'.json')
        value = {'run':run.name,'manifest_sha256':digest('evidence-manifest.json')}
        with promotion.open('x',encoding='utf-8') as stream:
            json.dump(value,stream,indent=2)
        selected.write_text(json.dumps(value,indent=2),encoding='utf-8')
    print(json.dumps({'checks':len(checks),'passed':len(checks),'run':run.name,
                      'assertions':sum(m['assertions'] for m in results['matrix']), 'observations':len(results['observations']),
                      'preserved_inputs':len(lock['preservation_before']), 'historical_receipt':historical,
                      'current_qualification':not historical,'manifest_sha256':digest('evidence-manifest.json')},indent=2))

if __name__=='__main__':
    main()
