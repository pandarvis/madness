"""Closed, bounded data reader. Never imports code from the consulted project.

The frontmatter scalar subset and id normalization follow tickets.py; unlike
join_plans, declarations are recorded before joining and never overwrite one another.
Scope: initiative root Markdown, ticket containers, and named documentary folders.
Qualification runs, evidence trees, hidden folders and executable files are not scanned.
"""
import datetime
import json
import os
from pathlib import Path
import re
import stat
import tomllib
import unicodedata
from bisect import bisect_right
from tomllib import _parser as toml_parser
import capture,files

MAX_FILES = 512
MAX_ENTRIES = 4096
MAX_BYTES = 8 * 1024 * 1024
MAX_EXCERPTS = 256
DOCUMENT_FOLDERS = {'planning-artifacts', 'implementation-artifacts', 'analysis', 'research', 'docs', 'decisions'}
RUN_FOLDER = re.compile(r'^(brief|prd|ux|architecture|research|prfaq|brainstorm|forge)-[A-Za-z0-9][A-Za-z0-9_-]*$')
STATUSES = {'draft', 'ready-for-dev', 'in-progress', 'in-review', 'built', 'done', 'blocked', 'dropped'}
TRACKER_STATUSES = {'backlog', 'in-progress', 'review', 'done', 'dropped'}

def scalar(value):
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
        return json.loads(value) if value[0] == '"' else value[1:-1].replace("''", "'")
    if value in ('true', 'false'):return value == 'true'
    if re.fullmatch(r'-?\d+', value):return int(value)
    return value

def identifier(value):
    if isinstance(value, bool):return None
    if isinstance(value, int):return str(value) if value >= 0 else None
    if isinstance(value, str) and re.fullmatch(r'[0-9A-Za-z]+', value) and value not in ('true', 'false'):
        return str(int(value)) if value.isdigit() else value
    return None

def frontmatter(text):
    lines = text.removeprefix('\ufeff').splitlines()
    if not lines or lines[0] != '---':return {}, {}, 0
    try:end = lines.index('---', 1)
    except ValueError:raise ValueError('FRONTMATTER_UNCLOSED') from None
    if len('\n'.join(lines[:end]).encode('utf-8')) > 65536:raise ValueError('FRONTMATTER_BOUND')
    result, locations = {}, {}
    for n, line in enumerate(lines[1:end], 2):
        # Plans contain block-list context. Only their top-level scalar fields are used.
        if not line.strip() or line.lstrip().startswith('#') or line[:1].isspace() or line.startswith('- '):continue
        match = re.fullmatch(r'([A-Za-z_][\w-]*):\s*(.*)', line)
        if not match:raise ValueError('FRONTMATTER_SYNTAX: line '+str(n))
        key, value = match.groups()
        if key in result:raise ValueError('FRONTMATTER_DUPLICATE: '+key)
        if key in ('id', 'ticket', 'type', 'title', 'status', 'tracker_status'):
            quoted = re.fullmatch(r'''("(?:[^"\\]|\\.)*"|'(?:[^']|'')*')\s+#.*''', value)
            value = quoted.group(1) if quoted else value.split('   #')[0].strip()
            if value.startswith(('[', '{', '|', '>')):raise ValueError('FRONTMATTER_SCALAR: '+key)
            if value and value[0] in "\"'" and (len(value) < 2 or value[-1] != value[0]):raise ValueError('FRONTMATTER_QUOTE: '+key)
            result[key] = scalar(value)
            locations[key] = n
    return result, locations, end + 1

def category(heading):
    value = ''.join(c for c in unicodedata.normalize('NFD', heading.lower()) if not unicodedata.combining(c))
    value = re.sub(r'[^a-z0-9 ]', ' ', value)
    value = ' '.join(value.split())
    if re.search(r'\b(decisions?|decision log)\b', value):return 'decisions'
    if re.search(r'\b(results?|resultats?|outcomes?|livrables?)\b', value):return 'results'
    if re.search(r'\b(remaining|next steps|work remaining|travail restant|reste a faire|suite connue|a faire)\b', value):return 'remaining'
    if re.search(r'\b(recap|recapitulatif|recapitulatifs|recapitulation|summary|resume factuel)\b', value):return 'recap'
    return None

def entry_locations(text):
    """Track statements using the same bundled, runtime-pinned TOML parser.

    No regex scans document values: key_value_rule consumes multiline strings,
    arrays, escaped/quoted keys and comments exactly as tomllib.loads does.
    Only [[entry]] itself and its own top-level fields receive locations.
    """
    src = text.removeprefix('\ufeff').replace('\r\n', '\n')
    newline_offsets = [at for at, char in enumerate(src) if char == '\n']
    line = lambda pos: bisect_right(newline_offsets, pos) + 1
    out = toml_parser.Output(toml_parser.NestedDict(), toml_parser.Flags())
    parse_float = toml_parser.make_safe_parse_float(float)
    pos, header, current, inline_start = 0, (), None, None
    result = []
    while pos < len(src):
        pos = toml_parser.skip_chars(src, pos, toml_parser.TOML_WS)
        if pos >= len(src):break
        char, start = src[pos], pos
        if char == '\n':pos += 1;continue
        if char in toml_parser.KEY_INITIAL_CHARS:
            _, key = toml_parser.parse_key(src, pos)
            if header == () and key == ('entry',):inline_start = line(start)
            if header == ('entry',) and current is not None and len(key) == 1:current['fields'][key[0]] = line(start)
            pos = toml_parser.key_value_rule(src, pos, out, header, parse_float)
        elif char == '[':
            out.flags.finalize_pending()
            if src.startswith('[[', pos):
                pos, header = toml_parser.create_list_rule(src, pos, out)
                current = None
                if header == ('entry',):
                    current = {'start': line(start), 'fields': {}}
                    result.append(current)
            else:
                pos, header = toml_parser.create_dict_rule(src, pos, out)
                current = None
        elif char != '#':raise ValueError('ENTRY_LOCATION_STATEMENT')
        pos = toml_parser.skip_chars(src, pos, toml_parser.TOML_WS)
        pos = toml_parser.skip_comment(src, pos)
        if pos < len(src):
            if src[pos] != '\n':raise ValueError('ENTRY_LOCATION_NEWLINE')
            pos += 1
    return result, inline_start

def collect(req, context):
    project = capture.long_path(req['project'])
    chosen = next((i for i in context['initiatives'] if i['id'] == req['initiativeId']), None)
    if context['status'] not in ('candidate-observed', 'partial'):raise ValueError('G2_PROFILE_REFUSED')
    if not chosen or context['revision'] != req['contextRevision'] or context['rootIdentity'] != req['rootIdentity']:raise ValueError('PROGRESS_CONTEXT_CHANGED')
    initiative = capture.long_path(chosen['path'])
    if not initiative.is_relative_to(project):raise ValueError('PROGRESS_OUTSIDE_PROJECT')
    root_chain, initiative_chain = capture.inspect_chain(project), capture.inspect_chain(initiative)
    sources, declarations, excerpts, problems = [], [], [], []
    readings, inventories, missing, refused = [], [], [], []
    source_cache = {}
    file_grants = []
    total = 0
    entries = 0

    def problem(message):
        if len(problems) >= 1024:raise ValueError('PROBLEM_BOUND')
        problems.append(str(message)[:4000])

    def present(path):
        capture.inspect_chain(path, missing=True)
        value = path.exists()
        if not value:missing.append(path)
        return value

    def listing(folder):
        nonlocal entries
        capture.inspect_chain(folder)
        before = [*capture.identity(folder.lstat())]
        names = sorted(p.name for p in folder.iterdir())
        entries += len(names)
        if entries > MAX_ENTRIES:raise ValueError('INVENTORY_BOUND: '+capture.display_path(folder))
        inventories.append((folder, before, names))
        return [folder / name for name in names]

    def source(path, kind):
        nonlocal total
        if path in source_cache:return source_cache[path]
        if len(sources) >= MAX_FILES:
            problem('FILE_COUNT_LIMIT: '+capture.display_path(path));return None
        try:
            before = path.lstat()
            stamp = [*capture.identity(before), before.st_size, before.st_mtime_ns, before.st_ctime_ns]
            physical = {'sourceId':'pending','path':str(path),'chain':capture.inspect_chain(path),'stamp':stamp}
            raw = capture.read_safe(path)
            physical.update(sha256=capture.sha(raw),bytes=len(raw))
            if total + len(raw) > MAX_BYTES:raise ValueError('TOTAL_BYTE_LIMIT')
            text = raw.decode('utf-8', errors='strict')
        except (OSError, ValueError) as error:
            problem('Source non chargee: '+capture.display_path(path)+': '+str(error))
            try:
                info = path.lstat();refused.append((path, [*capture.identity(info), info.st_size, info.st_mtime_ns, info.st_ctime_ns]))
            except OSError:pass
            return None
        total += len(raw)
        relative = path.relative_to(initiative).as_posix()
        source_id = 'source-'+capture.sha((context['rootIdentity']+'\n'+req['initiativeId']+'\n'+relative).encode('utf-8'))
        item = {'id': source_id, 'kind': kind, 'path': capture.display_path(path), 'relativePath': relative, 'sha256': capture.sha(raw), 'bytes': len(raw), 'modifiedAt': datetime.datetime.fromtimestamp(before.st_mtime, datetime.timezone.utc).isoformat()}
        physical['sourceId'] = source_id;file_grants.append(physical)
        sources.append(item);readings.append((path, stamp, item['sha256']))
        source_cache[path] = item, text
        return item, text

    def declaration(item, container, ticket, title, field, value, line):
        if len(declarations) >= 4096:raise ValueError('DECLARATION_BOUND')
        if not isinstance(value, (str, int)) or isinstance(value, bool):problem('Declaration non scalaire: '+item['path']+': '+field);return
        if not str(value):return
        if len(str(value)) > 1000 or len(title) > 1000:problem('Declaration hors limite: '+item['path']);return
        declarations.append({'sourceId': item['id'], 'container': container, 'ticketId': ticket, 'title': title, 'field': field, 'value': str(value), 'line': line})
        if field != 'existence' and str(value) not in (STATUSES if field == 'status' else TRACKER_STATUSES):problem('Statut inconnu conserve: '+item['path']+': '+str(value))

    def sections(item, text, body_start):
        lines = text.removeprefix('\ufeff').splitlines(keepends=True)
        headings, fence = [], None
        for n, line in enumerate(lines[body_start:], body_start):
            marker = re.match(r'^\s{0,3}(`{3,}|~{3,})', line)
            if marker:
                token = marker.group(1)[0]
                if fence is None:fence = token
                elif fence == token:fence = None
                continue
            if fence:continue
            match = re.match(r'^(#{1,6})\s+(.+?)\s*#*\s*$', line)
            if match:headings.append((n, len(match.group(1)), match.group(2)))
        for index, (at, level, heading) in enumerate(headings):
            kind = category(heading)
            if not kind:continue
            end = next((n for n, depth, _ in headings[index+1:] if depth <= level), len(lines))
            literal = ''.join(lines[at+1:end])
            if not literal.strip():continue
            if len(excerpts) >= MAX_EXCERPTS or len(literal) > 12000 or len(heading) > 500:
                problem('Section non chargee integralement (limite): '+item['path']+': '+heading);continue
            excerpts.append({'sourceId': item['id'], 'category': kind, 'heading': heading, 'text': literal, 'startLine': at+2, 'endLine': end})

    def markdown(path, kind, container, leaves=None, known_ids=None):
        result = source(path, kind)
        if result is None:return None
        item, text = result
        try:fm, locations, body_start = frontmatter(text)
        except (ValueError, TypeError) as error:problem(item['path']+': '+str(error));return None
        if 'ticket' in fm:kind = 'plan'
        elif fm.get('type') in ('story', 'spike', 'bug'):kind = 'leaf'
        elif kind in ('leaf', 'plan'):kind = 'document'
        item['kind'] = kind
        title = str(fm.get('title') or path.stem)
        ticket = identifier(fm.get('ticket' if kind == 'plan' else 'id'))
        if kind == 'leaf' and ticket is None:
            # Native load_folder retains recognized leaves without an id and
            # join_plans can address them by stem. This is a private reading
            # identity for that file, never a synthesized native ticket id.
            ticket = '@file:'+capture.sha(item['relativePath'].encode('utf-8'))
            problem('Identite native inconnue; reference de fichier conservee: '+item['path'])
        # tickets.py first joins an existing normalized id, then tries a leaf stem.
        # An alphanumeric stem is itself a syntactically valid id, but may name no row.
        if kind == 'plan' and (ticket is None or known_ids is not None and ticket not in known_ids) and isinstance(fm.get('ticket'), str) and leaves is not None:
            ticket = leaves.get(fm['ticket'], ticket)
        if kind in ('leaf', 'plan') and ticket is None:problem('Reference orpheline ou identite inconnue: '+item['path'])
        declaration(item, container, ticket, title, 'existence', kind, 1)
        for field in ('status', 'tracker_status'):
            if field in fm:declaration(item, container, ticket, title, field, fm[field], locations[field])
        sections(item, text, body_start)
        return ticket

    def tickets(container, depth=0):
        if depth > 8:raise ValueError('TICKET_DEPTH_LIMIT')
        if depth > 0:
            # PRD, architecture and UX also bind their run folder directly to
            # an epic. Only canonical runs immediately in this recognized
            # container are admitted; this is not a recursive document scan.
            for path in listing(container):
                if RUN_FOLDER.fullmatch(path.name):
                    try:conventional_documents(path)
                    except (OSError, ValueError) as error:problem('Portee documentaire de conteneur partielle: '+capture.display_path(path)+': '+str(error))
        folder = container / 'tickets'
        if not present(folder):return
        children = listing(folder)
        where = container.relative_to(initiative).as_posix()
        breakdown = folder / 'tickets.toml'
        entry_ids = []
        if breakdown in children:
            result = source(breakdown, 'entry')
            if result:
                item, text = result
                try:
                    table = tomllib.loads(text.removeprefix('\ufeff'))
                    rows = table.get('entry', [])
                    if not isinstance(rows, list) or not all(isinstance(row, dict) for row in rows):raise ValueError('ENTRY_TABLE')
                    locations, inline_start = entry_locations(text)
                    if len(locations) != len(rows):
                        # The native store also accepts an inline array of tables.
                        # Keep its entries visible at that assignment, but never
                        # invent a field's line inside an unlocated inline value.
                        problem('Provenance detaillee des entrees non etablie: '+item['path'])
                        locations = [{'start': inline_start, 'fields': {}} for _ in rows] if inline_start is not None else []
                    for row, location in zip(rows, locations):
                        at = location['start']
                        ticket = identifier(row.get('id'))
                        if ticket is None:problem('Identite entree inconnue: '+item['path']+': '+str(at))
                        if ticket in entry_ids:problem('Entrees dupliquees: '+item['path']+': '+str(ticket))
                        entry_ids.append(ticket)
                        declaration(item, where, ticket, str(row.get('title', '')), 'existence', 'entry', at)
                        for field in ('status', 'tracker_status'):
                            if field in row:
                                line = location['fields'].get(field)
                                if line is None:problem('Ligne de declaration non etablie: '+item['path']+': '+field)
                                else:declaration(item, where, ticket, str(row.get('title', '')), field, row[field], line)
                except (ValueError, TypeError) as error:problem('TOML invalide: '+item['path']+': '+str(error))
        leaves = {}
        leaf_ids = []
        files = [p for p in children if p.suffix == '.md' and not p.name.startswith('.')]
        # Source classification uses captured frontmatter. Plans are deferred solely for stem joins.
        plans, ordinary = [], []
        for path in files:
            result = source(path, 'document')
            if result is None:continue
            try:fm, _, _ = frontmatter(result[1])
            except (ValueError, TypeError):fm = {}
            (plans if 'ticket' in fm else ordinary).append(path)
        for path in ordinary:
            ticket = markdown(path, 'leaf', where)
            if ticket is not None:
                if ticket in leaf_ids:problem('Feuilles dupliquees: '+capture.display_path(path)+': '+ticket)
                leaf_ids.append(ticket);leaves[path.stem] = ticket
        plan_ids = []
        for path in plans:
            ticket = markdown(path, 'plan', where, leaves, set(entry_ids + leaf_ids))
            if ticket is not None and ticket in plan_ids:problem('Plans dupliques conserves: '+capture.display_path(path)+': '+ticket)
            plan_ids.append(ticket)
            if ticket is not None and ticket not in entry_ids and ticket not in leaf_ids:problem('Plan orphelin conserve: '+capture.display_path(path))
        for child in children:
            if child.name.startswith('epic-'):
                try:
                    capture.inspect_chain(child)
                    if child.is_dir():
                        own = child / (child.name+'.md')
                        has_own = present(own)
                        has_breakdown = present(child/'tickets'/'tickets.toml')
                        if not has_own and not has_breakdown:
                            problem('Conteneur non etabli: '+capture.display_path(child))
                            continue
                        if has_own:markdown(own, 'container', child.relative_to(initiative).as_posix())
                        tickets(child, depth+1)
                except (OSError, ValueError) as error:problem('Conteneur refuse: '+capture.display_path(child)+': '+str(error))

    def documents(folder, depth=0):
        if depth > 4:problem('DOCUMENT_DEPTH_LIMIT: '+capture.display_path(folder));return
        for path in listing(folder):
            if path.name.startswith('.'):continue
            if path.suffix == '.md':markdown(path, 'document', folder.relative_to(initiative).as_posix())
            elif path.suffix == '' and not path.name.startswith('qualification'):
                try:
                    capture.inspect_chain(path)
                    if path.is_dir():documents(path, depth+1)
                except (OSError, ValueError) as error:problem('Dossier documentaire refuse: '+capture.display_path(path)+': '+str(error))

    def conventional_documents(folder):
        # Installed v7 contracts: brief/PRD, UX, architecture, Deep Recon,
        # PRFAQ, Brainstorm and Forge all write <run>/<run>.md.
        # UX also adopts DESIGN/EXPERIENCE spines.
        # Inventory one folder, read only canonical Markdown, never imports,
        # mockups, .working, memlogs or nested qualification/evidence trees.
        listing(folder)
        expected = [folder / (folder.name+'.md')]
        if folder.name.startswith('ux-'):expected += [folder/'DESIGN.md', folder/'EXPERIENCE.md']
        if folder.name.startswith('research-'):expected += [folder/'brief.md']
        found = False
        for path in expected:
            if present(path):
                found = True
                markdown(path, 'document', folder.relative_to(initiative).as_posix())
        if not found:problem('Document canonique non retrouve: '+capture.display_path(folder))

    for path in listing(initiative):
        if path.name.startswith('.'):continue
        if path.suffix == '.md':markdown(path, 'container' if path.name == initiative.name+'.md' else 'document', '.')
        elif path.name in DOCUMENT_FOLDERS:
            try:documents(path)
            except (OSError, ValueError) as error:problem('Portee documentaire partielle: '+capture.display_path(path)+': '+str(error))
        elif RUN_FOLDER.fullmatch(path.name):
            try:conventional_documents(path)
            except (OSError, ValueError) as error:problem('Portee documentaire v7 partielle: '+capture.display_path(path)+': '+str(error))
    try:tickets(initiative)
    except (OSError, ValueError) as error:problem('Portee tickets partielle: '+str(error))

    dependency_state={'roots':[], 'lists':[(str(p),n,True) for p,_,n in inventories], 'optional':[(str(p),False) for p in missing], 'refused':[{'path':str(p)} for p,_ in refused]}
    hints=capture.observation_hints(dependency_state)
    own=capture.observation_hints({'roots':[{'path':str(initiative),'dirs':{},'files':{p.relative_to(initiative).as_posix():digest for p,_,digest in readings}}]})
    hints['entries'] += own['entries'] + context['_observationHints']['entries']
    hints['limited'] += own['limited'] + context['_observationHints']['limited']

    # Verify the same files, absent paths and inventoried names after every parse.
    # A mixed-time observation is refused rather than promoted to a partial success.
    for path, stamp, expected in readings:
        info = path.lstat()
        if [*capture.identity(info), info.st_size, info.st_mtime_ns, info.st_ctime_ns] != stamp or capture.sha(capture.read_safe(path)) != expected:raise ValueError('PROGRESS_SOURCE_CHANGED: '+capture.display_path(path))
    for folder, identity, names in inventories:
        capture.inspect_chain(folder)
        if list(capture.identity(folder.lstat())) != identity or sorted(p.name for p in folder.iterdir()) != names:raise ValueError('PROGRESS_INVENTORY_CHANGED: '+capture.display_path(folder))
    for path in missing:
        capture.inspect_chain(path, missing=True)
        if path.exists():raise ValueError('PROGRESS_ABSENCE_CHANGED: '+capture.display_path(path))
    for path, stamp in refused:
        info = path.lstat()
        if [*capture.identity(info), info.st_size, info.st_mtime_ns, info.st_ctime_ns] != stamp:raise ValueError('PROGRESS_REFUSAL_CHANGED: '+capture.display_path(path))
    if capture.inspect_chain(project) != root_chain or capture.inspect_chain(initiative) != initiative_chain:raise ValueError('PROGRESS_ROOT_CHANGED')
    state = {'sources': sources, 'declarations': declarations, 'excerpts': excerpts, 'problems': problems, 'inventories': [(capture.display_path(p), i, n) for p, i, n in inventories], 'fileIdentities': [(capture.display_path(p), stamp) for p, stamp, _ in readings]}
    revision = capture.sha(json.dumps(state, sort_keys=True, ensure_ascii=False).encode('utf-8'))
    file_grant=files.grant(req['folder'], project, 'progress', revision, file_grants, req['initiativeId'])
    return {'_fileGrant':file_grant,'_observationHints':hints,'rootIdentity': context['rootIdentity'], 'initiativeId': req['initiativeId'], 'initiativePath': capture.display_path(initiative), 'contextRevision': context['revision'], 'revision': revision, 'coverage': 'partial' if problems else 'complete', 'sources': sources, 'declarations': declarations, 'excerpts': excerpts, 'problems': problems}
