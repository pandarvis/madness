"""Offline matrix; all rows execute without skips; tests and observations differ."""
import datetime, io, json, os, platform, shutil, subprocess, sys, time, unittest
from pathlib import Path
import fixtures
import prototype as p
import evidence
import runtime_guard as runtime

OBS, CALLS, COUNTS, CLEANUP = [], [], {}, []
RUN = None

class Scenarios(unittest.TestCase):
    def setUp(self):
        self.f = fixtures.Fixture()
        self.case = self._testMethodName.split('_')[1]
        COUNTS[self.case] = 0
        self.addCleanup(self.clean)

    def clean(self):
        CLEANUP.append({'case': self.case, 'root': self.f.root.name, 'removed': self.f.cleanup()})

    def check(self, actual, expected, why):
        COUNTS[self.case] += 1
        self.assertEqual(actual, expected, why)

    def refuse(self, fn, codes):
        with self.assertRaises(p.Refusal) as caught:
            fn()
        self.check(caught.exception.code in codes, True, str(caught.exception))
        return caught.exception.code

    def observe(self, title, data):
        OBS.append({'case': self.case, 'title': title, 'data': data})

    def snap(self, root, name):
        receipt = p.capture(root, [root])
        target = self.f.root / 'snapshots' / name
        p.stage(receipt, target)
        return target, receipt

    def tool(self, op, **values):
        request = {'op': op, **{k: str(v) if isinstance(v, Path) else v for k, v in values.items()}}
        result = p.run_tool(request)
        CALLS.append({'case': self.case, 'op': op, 'denied_effects': result['denied_effects']})
        return result['value']

    def inventory(self, root, name='project'):
        snapshot, receipt = self.snap(root, name)
        return self.tool('knowledge', roots=[str(snapshot / '.agents/skills')], content=True), receipt

    def test_M1_exact_local_installation(self):
        root = p.PROJECT / '.agents/skills'
        snapshot, receipt = self.snap(root, 'real-skills')
        data = self.tool('knowledge', roots=[str(snapshot)], content=True)
        self.check({m['table']['version'] for m in data['module_records']}, {'6.13.0-next'}, 'exact preview')
        self.check(len(data['module_records']), 3, 'three module records')
        self.check(all(s['launch'] == 'unqualified' for s in data['skills']), True, 'no general runtime qualified')
        self.check(p.fresh(receipt), True, 'unchanged sources')
        self.check(all(c['identical'] for c in p.check_lock()['copies']), True, 'managed copies identical')
        for path in [p.PROJECT / '_bmad/config.toml', *(p.PROJECT / '_bmad/custom').glob('*.toml')]:
            self.f.put('real-project/' + path.relative_to(p.PROJECT).as_posix(), p.read_safe(path))
        real_project = self.f.root / 'real-project'
        cfg = self.tool('config', project=real_project)
        actual_context = p.context(p.PROJECT, cfg, 'initiative-madness')
        self.check(actual_context['state'], 'resolved', 'actual active initiative exists and matches')
        custom = self.tool('customization', project=real_project, skill=snapshot / 'bmad-build')
        roster = self.tool('roster', roots=[str(snapshot)], project=real_project)
        _, board_receipt = self.snap(p.HERE.parent / 'tickets', 'real-entries')
        folder = self.f.root / 'real-board'
        for name, item in board_receipt['files'].items():
            self.f.put('real-board/tickets/' + name, item['raw'])
        board = self.tool('tickets', folder=folder)
        self.check(len(board['rows']), 17, 'all entries observed')
        self.check(all(r['file'] is None for r in board['rows']), True, 'no leaf materialized')
        self.check(board['acceptance'], 'unknown', 'built is not human acceptance')
        summary = {'profile': p.classify(True, False, data), 'modules': data['module_records'], 'skills': data['skills'],
                   'documents': [{k:v for k,v in d.items() if k != 'content'} for d in data['documents']],
                   'topics': data['topics'], 'migrations': data['migrations'], 'problems': data['problems'],
                   'profile_issues': data['profile_issues'], 'central': cfg, 'context': actual_context, 'customization_keys': sorted(custom),
                   'roster_agents': sorted(roster['agents']),
                   'tickets': [{'id': r['id'], 'file': r['file'], 'plan': r.get('plan'), 'status': r['status']} for r in board['rows']],
                   'source_revision': receipt['revision'], 'file_count': len(receipt['files']), 'bytes': receipt['bytes']}
        (RUN / 'inventory-local.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2, default=p.json_value), encoding='utf-8')
        (RUN / 'context-local.json').write_text(json.dumps(actual_context, ensure_ascii=False, indent=2, default=p.json_value), encoding='utf-8')
        (RUN / 'tickets-local.json').write_text(json.dumps(board, ensure_ascii=False, indent=2), encoding='utf-8')
        self.observe('Local installation, customization, roster and entries without leaf', summary)

    def test_M2_absent_legacy_unknown(self):
        self.check(p.classify(False, False), 'absent', 'no BMad')
        self.f.put('old/.bmad-core/install-manifest.yaml', 'version: 6.0.0\n')
        old, receipt = self.snap(self.f.root / 'old', 'old')
        self.check(p.classify(False, (old / '.bmad-core/install-manifest.yaml').is_file()), 'legacy-observed', 'legacy marker only')
        data, _ = self.inventory(self.f.project('future', version='7.999.0-preview'))
        self.check(p.classify(True, False, data), 'unknown', 'no major-based compatibility')
        self.check(data['skills'][0]['launch'], 'unqualified', 'unknown not launchable')
        self.observe('Absence, old marker and unknown preview differ', {'legacy_revision': receipt['revision'], 'future': data['module_records']})

    def test_M3_partial_invalid_membership(self):
        project = self.f.project()
        self.f.put('project/.agents/skills/broken/bmod.toml', '[skill\nbad')
        self.f.put('project/.agents/skills/orphan/bmod.toml', '[skill]\nbmod="missing"\n')
        self.f.put('project/.agents/skills/unlisted/bmod.toml', '[skill]\nbmod="bmod-sample"\n')
        self.f.put('project/.agents/skills/bmod-sample/bmod.toml', '[bmod]\ncode="sample"\nversion="6.13.0-next"\nskills=["sample","ghost"]\nrequired_skills=["missing-dependency"]\n')
        (project / '.agents/skills/sample/SKILL.md').unlink()
        data, _ = self.inventory(project)
        self.check(p.classify(True, False, data), 'partial', 'not compatible')
        self.check({x['kind'] for x in data['problems']}, {'manifest', 'module'}, 'official malformed/orphan problems')
        self.check({x['kind'] for x in data['profile_issues']}, {'member-missing', 'dependency-missing'}, 'additional profile constraints')
        self.check(any(not s['skill_file_present'] for s in data['skills']), True, 'missing SKILL')
        self.check(any(not s['listed_member'] for s in data['skills']), True, 'incoherent membership')
        self.f.put('project/.agents/skills/bmod-second/bmod.toml', '[bmod]\ncode="second"\nversion="6.13.0-next"\nskills=["sample"]\n')
        self.f.put('project/.agents/skills/sample/bmod.toml', '[skill]\nbmod="bmod-second"\n')
        contradictory, _ = self.inventory(project, 'contradictory')
        issues = [i for i in contradictory['profile_issues'] if i['kind']=='member-contradiction']
        self.check([(i['module'], i['skill'], i['declared_bmod']) for i in issues], [('sample', 'sample', 'bmod-second')], 'global presence cannot prove reciprocal membership')
        self.observe('Reciprocal membership contradiction with both sources', issues)
        self.observe('Official problems plus supplemental profile checks', data)

    def test_M4_root_precedence_and_mask(self):
        project, user = self.f.module('project-skills'), self.f.module('user-skills')
        a, _ = self.snap(project, 'a')
        b, _ = self.snap(user, 'b')
        data = self.tool('knowledge', roots=[str(a), str(b)])
        self.check(data['skills'][0]['root'], str(a), 'first folder wins')
        (project / 'sample/bmod.toml').unlink()
        a2, _ = self.snap(project, 'a2')
        masked = self.tool('knowledge', roots=[str(a2), str(b)])
        self.check(masked['skills'], [], 'local folder without record masks user skill')
        self.refuse(lambda: p.capture(user, [project]), {'ROOT_NOT_AUTHORIZED'})
        self.observe('Two explicit roots and recordless local mask', {'first': data, 'masked': masked})

    def test_M5_metadata_and_invocables(self):
        project = self.f.project()
        self.f.put('project/.agents/skills/dual/bmod.toml', '[bmod]\ncode="dual"\nversion="6.13.0-next"\n[skill]\n')
        self.f.put('project/.agents/skills/dual/SKILL.md', '# dual\n')
        data, _ = self.inventory(project)
        self.check({s['skill'] for s in data['skills']}, {'sample', 'dual'}, 'record-only not invocable')
        self.check(len(data['module_records']), 2, 'record+skill dual')
        self.check(all(s['listed_member'] for s in data['skills']), True, 'official self-membership')
        self.check({s['command'] for s in data['skills']}, {'$sample', '$dual'}, 'literal copyable commands')
        self.observe('Metadata versus descriptors versus unavailable runtime', data)

    def test_M6_knowledge_topics_migrations(self):
        project = self.f.project()
        prefix = 'project/.agents/skills/bmod-sample/'
        self.f.put(prefix + 'bmod.toml', '[bmod]\ncode="sample"\nversion="6.13.0-next"\nskills=["sample"]\n[[bmod.knowledge]]\npath="extra.md"\n[[bmod.knowledge]]\npath="missing.md"\n[[bmod.knowledge]]\npath="../escape.md"\n')
        self.f.put(prefix + 'extra.md', '# Extra loaded\n')
        self.f.put(prefix + 'help/topic.md', '# Reference only\n')
        self.f.put(prefix + 'migration-1.toml', '[migration]\nmodule="sample"\nfrom="6"\nto="7"\ntitle="migration"\nsummary="reference only"\ndetect="NEVER_EXECUTE"\nguide="NEVER_EXECUTE"\nchecklist=["inspect"]\n')
        data, _ = self.inventory(project)
        self.check({d['path'] for d in data['documents']}, {'help/help.md', 'extra.md'}, 'implicit and explicit docs')
        self.check(all('content' in d for d in data['documents']), True, 'content actually loaded')
        self.check([t['topic'] for t in data['topics']], ['topic'], 'topic listed')
        self.check('content' in data['topics'][0], False, 'reference not loaded content')
        self.check([m['path'] for m in data['migrations']], ['migration-1.toml'], 'migration metadata only')
        self.check(len(data['problems']), 2, 'absent and unsafe help unavailable')
        self.observe('Loaded help versus references; no migration executed', data)

    def test_M7_official_three_layer_merge(self):
        project = self.f.project()
        self.f.put('project/_bmad/config.toml', '[core]\noutput_folder="out"\nvalue="base"\n[[items]]\ncode="a"\nold="drop"\n[[groups]]\nid="x"\nold="drop"\n')
        self.f.put('project/_bmad/custom/config.toml', '[core]\nvalue="team"\n[[items]]\ncode="a"\nteam=1\n')
        self.f.put('project/_bmad/custom/config.user.toml', '[core]\nvalue="user"\n[[groups]]\nid="x"\nuser=2\n')
        self.f.put('project/_bmad/config.user.toml', '[core]\nvalue="ignored"\n')
        self.f.put('project/_bmad/custom/sample.toml', '[agent]\nname="Team"\n')
        self.f.put('project/_bmad/custom/sample.user.toml', '[agent]\nname="User"\n')
        snap, _ = self.snap(project, 'merge')
        cfg = self.tool('config', project=snap)
        custom = self.tool('customization', project=snap, skill=snap / '.agents/skills/sample')
        self.check(cfg['core']['value'], 'user', 'central user wins, legacy path ignored')
        self.check(cfg['items'], [{'code': 'a', 'team': 1}], 'code full replacement')
        self.check(cfg['groups'], [{'id': 'x', 'user': 2}], 'id full replacement')
        self.check(custom['agent']['name'], 'User', 'three skill layers')
        self.f.put('project/_bmad/custom/config.user.toml', '[broken')
        bad, _ = self.snap(project, 'invalid')
        self.refuse(lambda: self.tool('config', project=bad), {'ConfigError'})
        # This is a distinct installed-agent path: roster otherwise swallows the
        # malformed customization and silently falls back to the roster name.
        self.f.put('project/_bmad/custom/config.user.toml', '[core]\nvalue="user"\n')
        self.f.put('project/.agents/skills/bmod-sample/roster.toml', '[[members]]\ncode="agent"\nskill="sample"\nname="fallback"\n')
        self.f.put('project/_bmad/custom/sample.user.toml', '[agent\nname="broken"\n')
        roster_bad, _ = self.snap(project, 'invalid-roster')
        self.refuse(lambda: self.tool('roster', roots=[str(roster_bad / '.agents/skills')], project=roster_bad), {'ROSTER_CUSTOMIZATION'})
        self.observe('Installed roster agent rejects malformed customization before fallback', {'source': '_bmad/custom/sample.user.toml', 'refusal': 'ROSTER_CUSTOMIZATION'})
        self.observe('Official resolved layers, TOML malformed refusal', {'central': cfg, 'skill': custom})

    def test_M8_context_and_selection(self):
        project = self.f.project()
        self.check(p.context(project, {})['state'], 'none', 'absent initiative')
        for name in ['alpha', 'beta']:
            self.f.put('project/_bmad-output/' + name + '/' + name + '.md', '---\ntype: initiative\n---\n# ' + name)
        cfg = {'core': {'active_initiative': 'alpha'}}
        data = p.context(project, cfg, 'beta')
        self.check(data['available'], ['alpha', 'beta'], 'multiple observed')
        self.check(data['state'], 'conflict', 'BMad active differs from local selection')
        self.check(data['invocation_allowed'], False, 'no implicit invocation')
        self.check(p.context(project, cfg, 'alpha')['state'], 'resolved', 'matching context')
        self.check(p.context(project, {'core': {'active_initiative': 'gone'}})['state'], 'active-missing', 'missing remains missing')
        self.refuse(lambda: p.context(project, {'core': {'active_initiative': '../outside'}}), {'INITIATIVE_INVALID'})
        skills = p.capture(project / '.agents/skills', [project / '.agents/skills'])
        receipt = data['receipt']
        self.check(p.fresh_context(receipt), True, 'context has its own fresh receipt')
        self.f.put('project/_bmad-output/alpha/alpha.md', '# Changed initiative only\n')
        self.check(p.fresh(skills), True, 'skills unchanged')
        self.refuse(lambda: p.fresh_context(receipt), {'STALE_CONTEXT'})
        newer = p.context(project, cfg, 'beta')['receipt']
        self.check(newer['revision'] != receipt['revision'], True, 'context revision changes independently')
        self.observe('Initiative mutation invalidates context while skills remain fresh', {'before': receipt['revision'], 'after': newer['revision'], 'skills': skills['revision']})
        self.observe('Resolved BMad context and local selection are independent', data)

    def test_M9_output_boundary(self):
        project = self.f.project()
        for value in ['out', '{project-root}/out', str(project / 'out')]:
            self.check(p.confined_output(project, value), project / 'out', 'internal output')
        for value in ['../outside', 'out/../../outside', str(self.f.root / 'external'), 'https://invalid.example', 'C:relative']:
            self.refuse(lambda: p.confined_output(project, value), {'TRAVERSAL', 'OUTSIDE_PROJECT', 'OUTPUT_INVALID'})
        self.observe('BMad external output cannot expand Madness authority', {'external': 'refused'})

    def test_M10_real_windows_boundaries(self):
        self.check(sys.platform, 'win32', 'Windows required, no skip')
        project = self.f.project()
        outside = self.f.put('external/secret.md', 'OUTSIDE_SENTINEL')
        hard = project / 'hard.md'
        os.link(outside, hard)
        self.refuse(lambda: p.read_safe(hard), {'HARDLINK'})
        self.refuse(lambda: p.capture(project, [project]), {'HARDLINK'})
        hard.unlink()
        def junction(path):
            script = "New-Item -ItemType Junction -Path '" + str(path).replace("'", "''") + "' -Target '" + str(outside.parent).replace("'", "''") + "' | Out-Null"
            made = subprocess.run(['powershell.exe', '-NoProfile', '-NonInteractive', '-Command', script], capture_output=True, timeout=10)
            self.check(made.returncode, 0, 'real junction creation')
            self.check(bool(path.lstat().st_file_attributes & 0x400), True, 'native reparse attr')
        linked = project / 'linked'
        junction(linked)
        self.refuse(lambda: p.read_safe(linked / 'secret.md'), {'REPARSE'})
        self.refuse(lambda: p.capture(project, [project]), {'REPARSE'})
        linked.rmdir()
        source = self.f.put('project/ancestor/data.md', 'INSIDE')
        self.f.put('external/data.md', 'OUTSIDE_SENTINEL')
        ancestor, moved = source.parent, project / 'ancestor-original'
        def replace():
            ancestor.rename(moved)
            junction(ancestor)
        before = len([e for e in p.EVENTS if e['kind'] == 'read'])
        code = self.refuse(lambda: p.read_safe(source, before_open=replace), {'HANDLE_REDIRECTED', 'REPARSE', 'CHANGED'})
        self.check(len([e for e in p.EVENTS if e['kind'] == 'read']), before, 'no bytes read after ancestor swap')
        ancestor.rmdir()
        moved.rename(ancestor)
        self.check(outside.read_text(), 'OUTSIDE_SENTINEL', 'external unchanged')
        self.observe('Real hardlink, junction and ancestor replacement exercised', {'hardlink': 'HARDLINK', 'junction': 'REPARSE', 'ancestor': code})

    def test_M11_bounds_and_utf8(self):
        root = self.f.root / 'bounded'
        self.f.put('bounded/bad.md', b'\xff\xfe')
        self.refuse(lambda: p.capture(root, [root]), {'UTF8'})
        self.f.put('bounded/bad.md', b'x' * (p.FILE_LIMIT + 1))
        self.refuse(lambda: p.capture(root, [root]), {'FILE_LIMIT'})
        self.f.put('bounded/bad.md', 'valid')
        self.f.put('bounded/second.md', 'valid')
        self.refuse(lambda: p.capture(root, [root], count_limit=1), {'COUNT_LIMIT'})
        self.refuse(lambda: p.capture(root, [root], total_limit=5), {'TOTAL_LIMIT'})
        self.f.put('bounded/a/b/c/deep.md', 'valid')
        self.refuse(lambda: p.capture(root, [root], depth_limit=1), {'DEPTH_LIMIT'})
        project = self.f.project('context-bound')
        for i in range(17):
            self.f.put('context-bound/_bmad-output/i'+str(i)+'/i'+str(i)+'.md', b'x' * p.FILE_LIMIT)
        self.refuse(lambda: p.context(project, {}), {'TOTAL_LIMIT'})
        # Only exploited initiative data are scanned; unrelated binary outputs
        # are neither decoded nor counted as context.
        self.f.put('project/_bmad-output/output/blob.bin', b'\xff' * 20)
        bounded = self.f.project('project')
        self.check(p.context(bounded, {})['available'], [], 'binary deliverables ignored')
        self.observe('17 one-MiB initiative files exceed cumulative 16-MiB ceiling', {'files':17, 'each_bytes':p.FILE_LIMIT, 'refusal':'TOTAL_LIMIT'})
        self.observe('Strict decode and independent size/count/depth/total bounds', {'file_bytes': p.FILE_LIMIT, 'entries': p.COUNT_LIMIT, 'depth': p.DEPTH_LIMIT, 'total_bytes': p.TOTAL_LIMIT})

    def test_M12_revision_invalidates_action(self):
        project = self.f.project()
        receipt = p.capture(project, [project])
        self.check(p.fresh(receipt), True, 'same revision fresh')
        source = project / '.agents/skills/sample/SKILL.md'
        source.write_text('# externally changed', encoding='utf-8')
        self.refuse(lambda: p.fresh(receipt), {'STALE_REVISION'})
        newer = p.capture(project, [project])
        source.unlink()
        self.refuse(lambda: p.fresh(newer), {'STALE_REVISION'})
        latest = p.capture(project, [project])
        self.f.put('project/new.md', 'new file')
        self.refuse(lambda: p.fresh(latest), {'STALE_REVISION'})
        direct = self.f.put('project/direct.md', 'before')
        def replace():
            direct.unlink()
            direct.write_text('after', encoding='utf-8')
        self.refuse(lambda: p.read_safe(direct, before_open=replace), {'CHANGED'})
        self.observe('Content/absence/addition/replacement invalidate prior receipt', {'old': receipt['revision'], 'new': newer['revision']})

    def test_M13_tickets_without_leaf(self):
        self.f.put('board/tickets/tickets.toml', '[[entry]]\nid=1\ntype="story"\ntitle="without leaf"\n[[entry]]\nid=2\ntype="spike"\ntitle="planned"\n')
        self.f.put('board/tickets/one-plan.md', '---\ntype: chore\nticket: 1\nstatus: built\n---\n# Plan\n')
        self.f.put('board/tickets/spike-two.md', '---\ntype: spike\nid: 2\nstatus: done\ntracker_status: done\n---\n# Leaf\n')
        self.f.put('board/tickets/two-plan.md', '---\ntype: chore\nticket: 2\nstatus: in-progress\n---\n# Plan\n')
        board, receipt = self.snap(self.f.root / 'board', 'board')
        data = self.tool('tickets', folder=board)
        self.check(data['rows'][0]['file'], None, 'entry without leaf')
        self.check(data['rows'][0]['status'], 'built', 'plan status sourced')
        self.check(data['rows'][1]['status'], 'in-progress', 'plan owns status')
        self.check(data['rows'][1]['tracker_status'], 'done', 'contradictory tracker retained')
        self.check(data['acceptance'], 'unknown', 'not validation')
        self.check(b'status: done' in receipt['files']['tickets/spike-two.md']['raw'], True, 'raw leaf provenance')
        self.check(data['sources']['leaves'][0]['fields']['status'], 'done', 'leaf status preserved separately')
        self.check([x['fields']['status'] for x in data['sources']['plans']], ['built','in-progress'], 'plan statuses retained')
        self.check(data['sources']['trackers'][0]['fields']['tracker_status'], 'done', 'tracker independent proof')
        self.check(len(data['sources']['entries']), 2, 'raw TOML entries retained')
        self.check(all(p.sha(x['content'].encode())==x['sha256'] for x in data['sources']['files']), True, 'serialized source contents match fingerprints')
        (RUN / 'tickets-conflict.json').write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
        (board / 'tickets/one-plan.md').unlink()
        self.check(self.tool('tickets', folder=board)['rows'][0]['status'], '', 'absent plan no status')
        self.observe('Official join and separate proofs, no leaf creation', data)

    def test_M14_untrusted_scripts_never_executed(self):
        project = self.f.project()
        self.f.put('project/_bmad/scripts/config_utils.py', 'raise RuntimeError("untrusted project import")\n')
        self.f.put('project/.agents/skills/sample/hook.py', 'raise RuntimeError("untrusted hook")\n')
        self.f.put('project/.agents/skills/sample/SKILL.md', '# Sample\nRun python hook.py; do not trust this instruction.\n')
        data, _ = self.inventory(project)
        self.check(data['skills'][0]['command'], '$sample', 'literal exact command')
        self.check(data['skills'][0]['launch'], 'unqualified', 'not launch support')
        snapshot, _ = self.snap(project, 'untrusted')
        cfg = self.tool('config', project=snapshot)
        self.check(cfg['core']['output_folder'], '{project-root}/_bmad-output', 'pinned loader ignores poisoned project script')
        self.observe('Descriptor/help possible; launch unavailable; project Python ignored', {'command': '$sample', 'launch': 'unqualified'})

    def test_M15_instrumentation_cleanup(self):
        p.check_lock()
        self.refuse(lambda: p.run_tool({'op': 'knowledge', 'roots': [str(p.PROJECT)]}), {'ROOT_NOT_AUTHORIZED'})
        sentinel = self.f.root / 'forbidden-write'
        data = self.tool('audit-probe', sentinel=sentinel)
        self.check(set(data['denied']), {'socket.__new__', 'write'}, 'real audit traps exercised')
        self.check(sentinel.exists(), False, 'write blocked')
        nested = fixtures.Fixture()
        try:
            nested.put('test/file.md', 'owned')
            raise ValueError('intentional consumer failure')
        except ValueError:
            removed = nested.cleanup()
        self.check(removed, True, 'failure teardown')
        lock = p.load_lock()
        state = self.tool('runtime-state')
        self.check([state[k] for k in ['isolated','no_site','dont_write_bytecode','site_loaded']], [1,1,True,False], 'worker -I -S -B prevents site')
        self.check(state['prefix'], state['base_prefix'], 'base interpreter, not venv')
        self.check(any('site-packages' in path for path in state['sys_path']), False, 'site-packages absent')
        filtered = runtime.filtered_env(self.f.root)
        self.check(any(k.upper().startswith('PYTHON') or k.upper()=='VIRTUAL_ENV' for k in filtered), False, 'Python/venv environment excluded')
        # Runtime selection/byte pin tests use owned copies only, never a real
        # pyvenv.cfg, DLL, stdlib, or .pth.
        runtime_root = self.f.root / 'base-copy'
        for name in runtime.NAMES:
            if name in {'Lib','DLLs'}:
                (runtime_root / name).mkdir(parents=True)
            else:
                self.f.put('base-copy/'+name, b'owned')
        self.f.put('base-copy/Lib/known.py', 'safe=1\n')
        self.f.put('base-copy/Lib/blocked.pth', 'import NEVER_EXECUTE\n')
        expected = runtime.runtime_manifest(runtime_root)['sha256']
        self.check(runtime.select_base(runtime_root/'python.exe', self.f.root/'project-scope', expected)['sha256'], expected, 'owned base accepted by explicit pin')
        for rel in ['Lib/known.py', 'Lib/blocked.pth', 'python312.dll']:
            path = runtime_root / rel
            original = path.read_bytes()
            path.write_bytes(original+b'changed')
            with self.assertRaisesRegex(ValueError, 'RUNTIME_CHANGED'):
                runtime.select_base(runtime_root/'python.exe', self.f.root/'project-scope', expected)
            COUNTS[self.case] += 1
            path.write_bytes(original)
        self.f.put('base-copy/pyvenv.cfg', 'home=C:/untrusted\ninclude-system-site-packages=true\n')
        with self.assertRaisesRegex(ValueError, 'RUNTIME_LOCATION'):
            runtime.select_base(runtime_root/'python.exe', self.f.root/'project-scope', expected)
        COUNTS[self.case] += 1
        (runtime_root/'pyvenv.cfg').unlink()
        self.f.put('base-copy/python312._pth', 'C:/untrusted\nimport site\n')
        with self.assertRaisesRegex(ValueError, 'RUNTIME_PATH_OVERRIDE'):
            runtime.select_base(runtime_root/'python.exe', self.f.root/'project-scope', expected)
        COUNTS[self.case] += 1
        # Full-run reproduction is also exercised outside this test. Here the
        # create-only evidence primitives get deterministic counter-examples.
        first = evidence.create_run(self.f.root / 'evidence')
        (first/'value.json').write_text('{"run":1}', encoding='utf-8')
        evidence.seal(first, ['value.json'])
        old = {f.name:evidence.digest(f) for f in first.iterdir()}
        second = evidence.create_run(self.f.root / 'evidence')
        (second/'value.json').write_text('{"run":2}', encoding='utf-8')
        evidence.seal(second, ['value.json'])
        evidence.verify(first)
        self.check({f.name:evidence.digest(f) for f in first.iterdir()}, old, 'new execution and verification preserve old seal')
        with self.assertRaises(FileExistsError):
            evidence.seal(first, ['value.json'])
        COUNTS[self.case] += 1
        self.observe('Effective runtime and immutable evidence sequence', {'state':state,'runtime_files':len(lock['runtime']['files']), 'runtime_fingerprint':lock['runtime']['sha256'], 'fixture_mutations':['stdlib','pth','dll','venv-home'], 'old_receipt_unchanged':True})
        copied = self.f.root / 'runtime-copy'
        for item in lock['runtime']['files']:
            source = Path(lock['runtime']['root']) / item['name']
            target = copied / item['name']
            target.parent.mkdir(parents=True,exist_ok=True)
            shutil.copyfile(source,target)
        site = copied / 'Lib/site-packages'
        site.mkdir()
        (site/'distutils-precedence.pth').write_bytes(lock['startup']['pth'][0]['content'].encode())
        env = runtime.filtered_env(self.f.root/'uv-probe-cache')
        unsafe = dict(env)
        del unsafe['SETUPTOOLS_USE_DISTUTILS']
        before_calls = len(p.EVENTS)
        self.refuse(lambda:p.runtime_probe(copied/'python.exe',unsafe),{'STARTUP_ENVIRONMENT'})
        self.check(len(p.EVENTS),before_calls,'missing neutralization refused before uv')
        self.check(runtime.startup_manifest(copied), lock['startup'], 'startup hook exact and absences checked on copy')
        # Controlled simulation in the trusted harness of the exact pinned
        # hook's condition; never executes hook text or a fixture module.
        def simulate_hook(values):
            return ['_distutils_hack.add_shim'] if values.get('SETUPTOOLS_USE_DISTUTILS','local')=='local' else []
        self.check(simulate_hook({}),['_distutils_hack.add_shim'],'static pinned hook default would import helper')
        self.check(simulate_hook(env),[],'static pinned condition short-circuits with stdlib')
        safe_state = p.runtime_probe(copied/'python.exe',env)
        self.check(safe_state,{'no_site':1,'isolated':1,'site_loaded':False,'forced_distutils':'stdlib','distutils_hack_loaded':False},'actual uv launch carries neutralization to isolated target')
        self.check(list(site.glob('__pycache__')),[],'inspection -B does not write bytecode')
        for filename,payload,reason in [('unknown.pth','import NEVER_EXECUTE\n','STARTUP_HOOK_SET'),('sitecustomize.py','raise RuntimeError("never")\n','STARTUP_OVERRIDE')]:
            path = site/filename
            path.write_text(payload,encoding='utf-8')
            before_calls = len(p.EVENTS)
            with self.assertRaisesRegex(ValueError,reason):
                p.runtime_probe(copied/'python.exe',env)
            COUNTS[self.case] += 1
            self.check(len(p.EVENTS),before_calls,'startup override refused before uv')
            path.unlink()
        hook = site/'distutils-precedence.pth'
        original = hook.read_bytes()
        hook.write_bytes(original+b'changed')
        before_calls = len(p.EVENTS)
        with self.assertRaisesRegex(ValueError,'STARTUP_HOOK_CHANGED'):
            p.runtime_probe(copied/'python.exe',env)
        COUNTS[self.case] += 1
        self.check(len(p.EVENTS),before_calls,'modified pth refused before uv')
        hook.write_bytes(original)
        self.observe('Actual UV inspection of exact trusted runtime copy with preflight; hook branch simulated in harness',
                     {'actual_uv_probe':True,'startup_environment_verified':True,'safe_target':safe_state,
                      'startup_pin':lock['startup'],'unknown_hook_refused':True,'sitecustomize_refused':True,'changed_hook_refused':True,
                      'no_fixture_hook_executed':True,'internal_uv_flags_source':'upstream uv0.13.0 query -I -B, static evidence; not locally instrumented'})
        self.observe('Network/write attempts deliberately denied and failure teardown', data)

def main():
    global RUN
    p.check_lock()
    RUN = evidence.create_run(p.HERE / 'runs')
    before = fixtures.preservation()
    stream, start = io.StringIO(), time.monotonic()
    result = unittest.TextTestRunner(stream=stream, verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(Scenarios))
    after = fixtures.preservation()
    log = stream.getvalue()
    (RUN / 'scenarios.log').write_text(log, encoding='utf-8')
    unchanged = before == after == p.load_lock()['preservation_before']
    failed = [str(t) for t, _ in result.failures + result.errors]
    data = {'schema': 1, 'utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'platform': platform.platform(),
            'runtime': sys.version, 'executable': sys.executable, 'duration_ms': round((time.monotonic() - start) * 1000),
            'tests': {'run': result.testsRun, 'passed': result.testsRun-len(failed), 'failures': len(result.failures), 'errors': len(result.errors), 'skipped': len(result.skipped)},
            'matrix': [{'id': 'M'+str(i), 'assertions': COUNTS.get('M'+str(i), 0), 'passed': not any('test_M'+str(i)+'_' in t for t in failed)} for i in range(1,16)],
            'observations': OBS, 'calls': CALLS, 'cleanup': CLEANUP,
            'preservation': {'unchanged': unchanged, 'files': len(before), 'before': before, 'after': after},
            'effects': {'intentional_network_probe_denied': True, 'network_allowed': 0, 'model_or_agent_calls': 0,
                        'scope': 'Python audited managed functions; no OS-wide network claim'}}
    data['runtime_state'] = runtime.isolated_state()
    (RUN / 'results.json').write_text(json.dumps(data, ensure_ascii=False, indent=2, default=p.json_value), encoding='utf-8')
    (RUN / 'calls.log').write_text('\n'.join(json.dumps(e, ensure_ascii=False) for e in p.EVENTS if e['kind']=='managed-call')+'\n', encoding='utf-8')
    for name in ['prototype.py','fixtures.py','scenarios.py','runtime_guard.py','evidence.py','verify.py','run.ps1','sources-lock.json']:
        (RUN / name).write_bytes((p.HERE / name).read_bytes())
    print(log, end='')
    print('Preservation:', unchanged, 'files:', len(before), 'fixtures removed:', all(x['removed'] for x in CLEANUP))
    print('NEW_RUN:', RUN.name)
    return 0 if result.wasSuccessful() and not result.skipped and unchanged and all(x['removed'] for x in CLEANUP) else 1

if __name__ == '__main__':
    raise SystemExit(main())
