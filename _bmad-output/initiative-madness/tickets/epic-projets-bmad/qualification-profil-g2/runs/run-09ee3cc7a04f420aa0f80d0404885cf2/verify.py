"""Closed verifier. Only --seal and --promote write, both explicit create-only."""
import argparse
import json
from pathlib import Path
import fixtures
import prototype as p
import evidence

CODE = ['prototype.py','fixtures.py','scenarios.py','runtime_guard.py','evidence.py','verify.py','run.ps1','runtime-preflight.ps1','preflight-probe.ps1','sources-lock.json']
LEGACY_CODE = list(CODE)
DATA = ['results.json','inventory-local.json','context-local.json','tickets-local.json','tickets-conflict.json','scenarios.log','calls.log']

def resolve_run(name):
    if not name or Path(name).name != name or not name.startswith('run-'):
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
    name = args.run or json.loads(selected.read_text(encoding='utf-8'))['run']
    run = resolve_run(name)
    checks = []
    def check(label, condition):
        checks.append({'check':label,'passed':bool(condition)})
        if not condition:
            raise AssertionError(label)
    lock = p.check_lock()
    execution = json.loads((run/'execution.json').read_text(encoding='utf-8')) if (run/'execution.json').exists() else None
    if execution and (execution['outcome'] != 'completed' or execution['exit'] != 0 or not (run/'results.json').exists()):
        if args.seal or args.promote:
            raise ValueError('INCOMPLETE_NOT_QUALIFIED')
        snapshots = json.loads((run/'sources-lock.json').read_text(encoding='utf-8')) if (run/'sources-lock.json').exists() else None
        available = {}
        for file in sorted(run.iterdir()):
            p.inspect_chain(file)
            if file.is_file():
                available[file.name] = evidence.digest(file)
        if snapshots:
            for item, expected in snapshots.get('bench',{}).items():
                if item in available and available[item] != expected:
                    raise ValueError('INCOMPLETE_CODE_CHANGED')
        check('owned cleanup recorded',bool(execution['cleanup']) and all(c['removed'] for c in execution['cleanup']))
        check('owned cleanup observed',all(not Path(value).exists() for value in execution['owned'] if Path(value).name.startswith('fixtures-run-')))
        print(json.dumps({'checks':len(checks),'passed':len(checks),'run':run.name,
                          'execution_outcome':execution['outcome'],'results_present':(run/'results.json').exists(),
                          'available_sha256':available,'current_qualification':False,'incomplete':True},indent=2))
        return
    run_lock = json.loads((run/'sources-lock.json').read_text(encoding='utf-8'))
    schema = run_lock.get('schema',1)
    historical = schema < 3
    code = [n for n in LEGACY_CODE if n not in {'runtime-preflight.ps1','preflight-probe.ps1'}] if schema == 1 else LEGACY_CODE if schema == 2 else [*run_lock['bench'],'sources-lock.json']
    data_names = DATA if historical else DATA+['execution.json','launcher.stdout.log','launcher.stderr.log']
    if args.seal or args.promote:
        check('current policy required for new seal/promotion',not historical)
    for name in code + data_names:
        check('artifact '+name, (run/name).is_file())
    for name in code:
        # A read-only historical verification checks the sealed copy, not the
        # current revision of a harness that has legitimately evolved.
        check('executed code/pins preserved '+name, (run/name).is_file() and (not (args.seal or args.promote) or evidence.digest(run/name)==evidence.digest(p.HERE/name)))
    results = json.loads((run/'results.json').read_text(encoding='utf-8'))
    check('15 tests without skips', results['tests']=={'run':15,'passed':15,'failures':0,'errors':0,'skipped':0})
    check('complete unique matrix', len(results['matrix'])==15 and {m['id'] for m in results['matrix']}=={'M'+str(i) for i in range(1,16)})
    check('assertions on every row', all(m['passed'] and m['assertions']>0 for m in results['matrix']))
    log = (run/'scenarios.log').read_text(encoding='utf-8')
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
    calls = [json.loads(s) for s in (run/'calls.log').read_text(encoding='utf-8').splitlines()]
    check('bounded managed calls', all(c['stdout_bytes']<=p.OUTPUT_LIMIT and c['stderr_bytes']<=p.OUTPUT_LIMIT and c['duration_ms']<p.TIME_LIMIT*1000 for c in calls))
    check('uv offline/no config, isolated base every ordinary call', all(all(flag in c['argv'] for flag in ['--offline','--no-project','--no-config','-I','-S','-B']) and (c['op']=='runtime-inspection-probe' or str(Path(run_lock['runtime']['root'])/'python.exe') in c['argv']) for c in calls))
    state = results['runtime_state']
    check('entry launcher isolated base', state['isolated']==1 and state['no_site']==1 and state['dont_write_bytecode'] and not state['site_loaded'] and state['prefix']==state['base_prefix'])
    inventory = json.loads((run/'inventory-local.json').read_text(encoding='utf-8'))
    check('exact local preview', len(inventory['modules'])==3 and {m['table']['version'] for m in inventory['modules']}=={'6.13.0-next'})
    check('partial not promoted', inventory['profile']=='partial' and all(s['launch']=='unqualified' for s in inventory['skills']))
    check('17 TOML entries no leaves', len(inventory['tickets'])==17 and all(t['file'] is None for t in inventory['tickets']))
    context = json.loads((run/'context-local.json').read_text(encoding='utf-8'))['receipt']
    check('distinct bounded context receipt', context['kind']==('context-v1' if schema == 1 else 'context-v2') and context['bytes']<=p.TOTAL_LIMIT and context['revision']!=inventory['source_revision'])
    check('context raw bytes match fingerprints', all(p.sha(v['raw'].encode())==v['sha256'] for v in context['files'].values()))
    conflict = json.loads((run/'tickets-conflict.json').read_text(encoding='utf-8'))
    check('leaf and plan statuses independently retained', conflict['sources']['leaves'][0]['fields']['status']=='done' and conflict['sources']['plans'][1]['fields']['status']=='in-progress')
    check('tracker and entry retained', conflict['sources']['trackers'][0]['fields']['tracker_status']=='done' and len(conflict['sources']['entries'])==2)
    check('ticket raw sources match hashes', all(p.sha(s['content'].encode())==s['sha256'] for s in conflict['sources']['files']))
    check('six counterexamples executed', len(results['observations'])>=20)
    if schema >= 2:
        check('context derives exactly from captured layers',p.load_tool('config_utils').merge_layers([p.tomllib.loads(p.parse_text(context['files'][rel]['raw'].encode('utf-8'))) if rel in context['files'] else {} for rel in context['resolution']['layers']])==context['resolved_config'])
        check('alpha beta mutation exercised',any(o['case']=='M12' and o['data'].get('stale_resolution')=='CONFIG_RESOLUTION_MISMATCH' and o['data'].get('skills_unchanged') for o in results['observations']))
        startup = next(o['data'] for o in results['observations'] if o['case']=='M15' and o['data'].get('closed_runtime_verified'))
        check('uv closed startup probe observed',startup['actual_uv_probe'] and startup['no_fixture_hook_executed'] and startup['native_first_launch_guard_exercised'])
        check('all new executable variants refused before launch',len(startup['refused_variants'])==14 and all(v['native_refused'] and v['probe_refused'] and not v['launched'] for v in startup['refused_variants']))
        check('closed allowed set pinned',lock['runtime']['policy']=='closed-copy-v2' and lock['startup']['allowed_files']==734)
    if not historical:
        check('schema3 results and terminal launcher',results['schema']==3 and execution['schema']==3 and execution['outcome']=='completed' and execution['exit']==0)
        check('parent cleanup complete',bool(execution['cleanup']) and all(c['removed'] for c in execution['cleanup']))
        check('entry source closure tied to receipt',results['bench_execution']['policy']=='captured-source-only-v3' and results['bench_execution']['sha256']==p.bench_manifest(run_lock) and results['bench_execution']['bootstrap_sha256']==run_lock['bench']['source_bootstrap.py'])
        check('native stdout log really captured',(run/'launcher.stdout.log').stat().st_size>0 and 'NEW_RUN: '+run.name in (run/'launcher.stdout.log').read_text(encoding='utf-8'))
        check('Windows encoding variants retain independent fields',len(conflict['encoding_variants'])==3 and all(v['proof']['sources']['leaves'][0]['fields']['status']=='done' and v['proof']['sources']['plans'][1]['fields']['status']=='in-progress' for v in conflict['encoding_variants']))
        check('Windows raw bytes match original fingerprints',all(p.sha(s['content'].encode('utf-8'))==s['sha256'] for v in conflict['encoding_variants'] for s in v['proof']['sources']['files']))
        imports = next(o['data'] for o in results['observations'] if o['case']=='M15' and o['data'].get('source_only'))
        check('source-only adversarial harness formats exercised',len(imports['ignored_variants'])==8 and imports['changed_source_refused'] and imports['sha256']==p.bench_manifest(run_lock))
        supervision = next(o['data'] for o in results['observations'] if o['case']=='M15' and 'forced' in o['data'])
        check('real forced stop after child fixture observed',supervision['forced']['outcome']=='timeout' and supervision['forced']['marker_observed'] and not supervision['forced']['results_present'])
        check('failed start and next run observed',supervision['failed_start']['outcome']=='start-failed' and supervision['next']['outcome']=='completed' and supervision['next']['exit']==0)
        check('forced and failed resources removed',all(c['removed'] for n in ['forced','next','failed_start'] for c in supervision[n]['cleanup']))
    if args.seal:
        evidence.seal(run, code+data_names)
    manifest = evidence.verify(run)
    check('all required evidence sealed', set(manifest['sha256'])==set(code+data_names))
    if args.promote:
        if args.seal:
            raise ValueError('SEPARATE_SEAL_AND_PROMOTION')
        # Explicit promotion has its own create-only record; selection is the
        # single replaceable pointer, never an execution receipt or a seal.
        promotion = p.HERE / ('promotion-'+run.name+'.json')
        value = {'run':run.name,'manifest_sha256':evidence.digest(run/'evidence-manifest.json')}
        with promotion.open('x',encoding='utf-8') as stream:
            json.dump(value,stream,indent=2)
        selected.write_text(json.dumps(value,indent=2),encoding='utf-8')
    print(json.dumps({'checks':len(checks),'passed':len(checks),'run':run.name,
                      'assertions':sum(m['assertions'] for m in results['matrix']), 'observations':len(results['observations']),
                      'preserved_inputs':len(lock['preservation_before']), 'historical_receipt':historical,
                      'current_qualification':not historical,'manifest_sha256':evidence.digest(run/'evidence-manifest.json')},indent=2))

if __name__=='__main__':
    main()
