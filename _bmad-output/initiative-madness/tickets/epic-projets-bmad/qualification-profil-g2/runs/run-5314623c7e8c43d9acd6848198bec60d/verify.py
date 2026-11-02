"""Closed verifier. Only --seal and --promote write, both explicit create-only."""
import argparse
import json
from pathlib import Path
import fixtures
import prototype as p
import evidence

CODE = ['prototype.py','fixtures.py','scenarios.py','runtime_guard.py','evidence.py','verify.py','run.ps1','sources-lock.json']
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
    for name in CODE + DATA:
        check('artifact '+name, (run/name).is_file())
    for name in CODE:
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
    check('uv offline/no config, isolated base every ordinary call', all(all(flag in c['argv'] for flag in ['--offline','--no-project','--no-config','-I','-S','-B']) and (c['op']=='runtime-inspection-probe' or str(Path(lock['runtime']['root'])/'python.exe') in c['argv']) for c in calls))
    state = results['runtime_state']
    check('entry launcher isolated base', state['isolated']==1 and state['no_site']==1 and state['dont_write_bytecode'] and not state['site_loaded'] and state['prefix']==state['base_prefix'])
    inventory = json.loads((run/'inventory-local.json').read_text(encoding='utf-8'))
    check('exact local preview', len(inventory['modules'])==3 and {m['table']['version'] for m in inventory['modules']}=={'6.13.0-next'})
    check('partial not promoted', inventory['profile']=='partial' and all(s['launch']=='unqualified' for s in inventory['skills']))
    check('17 TOML entries no leaves', len(inventory['tickets'])==17 and all(t['file'] is None for t in inventory['tickets']))
    context = json.loads((run/'context-local.json').read_text(encoding='utf-8'))['receipt']
    check('distinct bounded context receipt', context['kind']=='context-v1' and context['bytes']<=p.TOTAL_LIMIT and context['revision']!=inventory['source_revision'])
    check('context raw bytes match fingerprints', all(p.sha(v['raw'].encode())==v['sha256'] for v in context['files'].values()))
    conflict = json.loads((run/'tickets-conflict.json').read_text(encoding='utf-8'))
    check('leaf and plan statuses independently retained', conflict['sources']['leaves'][0]['fields']['status']=='done' and conflict['sources']['plans'][1]['fields']['status']=='in-progress')
    check('tracker and entry retained', conflict['sources']['trackers'][0]['fields']['tracker_status']=='done' and len(conflict['sources']['entries'])==2)
    check('ticket raw sources match hashes', all(p.sha(s['content'].encode())==s['sha256'] for s in conflict['sources']['files']))
    check('six counterexamples executed', len(results['observations'])>=20)
    if args.seal or args.promote:
        check('uv startup probe observed', any(o['case']=='M15' and o['data'].get('actual_uv_probe') is True and o['data'].get('startup_environment_verified') is True and o['data'].get('no_fixture_hook_executed') is True for o in results['observations']))
        check('startup path pinned', 'startup' in lock and lock['startup']['forced_environment']=={'SETUPTOOLS_USE_DISTUTILS':'stdlib'})
    if args.seal:
        evidence.seal(run, CODE+DATA)
    manifest = evidence.verify(run)
    check('all required evidence sealed', set(manifest['sha256'])==set(CODE+DATA))
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
                      'preserved_inputs':len(lock['preservation_before']), 'manifest_sha256':evidence.digest(run/'evidence-manifest.json')},indent=2))

if __name__=='__main__':
    main()
