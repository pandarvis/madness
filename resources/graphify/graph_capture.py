"""Original physical code corpus and owned mirror. No third-party imports."""
import os,sys,json,stat,hashlib,datetime
from pathlib import Path
import capture,files
EXTENSIONS={'.py','.ts','.tsx','.js','.jsx','.mjs','.cjs','.cs','.java','.c','.h','.cpp','.hpp','.rs','.go','.rb','.php','.swift','.kt','.scala','.vue','.svelte'}
EXCLUDED={'.git','.hg','.svn','.agents','.codex','.claude','.github','node_modules','.venv','venv','__pycache__','dist','out','build','coverage','target','vendor','hooks','plugins','_bmad','_bmad-output'}
CONFIG_NAMES={'setup.py','conftest.py','sitecustomize.py','usercustomize.py','vite.config.ts','vitest.config.ts','webpack.config.js','rollup.config.js','eslint.config.js','next.config.js','next.config.ts','postcss.config.js','tailwind.config.js','tailwind.config.ts','electron.vite.config.ts'}
def code(path):
    return path.suffix.lower() in EXTENSIONS and not path.name.startswith('.') and path.name not in CONFIG_NAMES and '.config.' not in path.name and not path.name.endswith('.d.ts')
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='milliseconds').replace('+00:00','Z')
def bundled_assembly(directory, relative):
    if relative != 'resources/graphify/assembly':
        return False
    try:
        marker = capture.read_safe(directory.parent/'assembly.json', utf8=False)
        trusted = capture.read_safe(Path(__file__).with_name('assembly.json'), utf8=False)
        if marker != trusted:
            return False
        manifest = json.loads(trusted)
        expected = {
            f'{group}/{record["name"]}'
            for group in ('runtime', 'packages') for record in manifest[group]
        }
        directories = {parent.as_posix() for name in expected for parent in Path(name).parents}
        found = set()
        pending = [directory]
        while pending:
            with os.scandir(pending.pop()) as entries:
                for entry in entries:
                    name = Path(entry.path).relative_to(directory).as_posix()
                    if entry.is_symlink():
                        return False
                    if name in directories and entry.is_dir(follow_symlinks=False):
                        if getattr(entry.stat(follow_symlinks=False), 'st_file_attributes', 0) & 0x400:
                            return False
                        pending.append(entry.path)
                    elif name in expected and entry.is_file(follow_symlinks=False):
                        found.add(name)
                    else:
                        return False
        return found == expected
    except (capture.Refusal, OSError, ValueError, KeyError, TypeError):
        return False

def inventory(project):
    root=capture.long_path(project);chain=capture.inspect_chain(root)
    if not root.is_dir():raise capture.Refusal('ROOT_TYPE')
    entries=[];dirs={};excluded=[];size=0;count=0
    def visit(folder,depth):
        nonlocal size,count
        if depth>24:raise capture.Refusal('DEPTH_LIMIT')
        capture.inspect_chain(folder);dirs[folder.relative_to(root).as_posix()]=[str(v) for v in capture.identity(folder.lstat())]
        for p in sorted(folder.iterdir(),key=lambda p:p.name):
            count+=1
            if count>10000:raise capture.Refusal('INVENTORY_LIMIT')
            relative=p.relative_to(root).as_posix()
            if p.name in EXCLUDED or p.name.startswith('.'):
                excluded.append(relative);continue
            st=p.lstat()
            if stat.S_ISDIR(st.st_mode):
                capture.inspect_chain(p)
                if bundled_assembly(p, relative):
                    excluded.append(relative)
                    continue
                visit(p,depth+1)
            elif code(p):
                capture.inspect_chain(p)
                if len(entries)>=1024:raise capture.Refusal('SOURCE_COUNT_LIMIT')
                raw=capture.read_safe(p,utf8=False);size+=len(raw)
                if size>16*1024*1024:raise capture.Refusal('SOURCE_TOTAL_LIMIT')
                entry=files.record(p,'code-'+hashlib.sha256(relative.encode()).hexdigest(),raw)
                entry['relativePath']=relative
                try:entry['lineCount']=len(raw.decode('utf-8',errors='strict').splitlines())
                except UnicodeError:entry['lineCount']=None
                entries.append((entry,raw))
            else:excluded.append(relative)
    visit(root,0)
    if capture.inspect_chain(root)!=chain:raise capture.Refusal('ROOT_CHANGED')
    public={'rootChain':chain,'dirs':dirs,'files':[e for e,b in entries]}
    revision=capture.sha(json.dumps(public,sort_keys=True,separators=(',',':')).encode())
    return root,chain,entries,excluded,revision

def operate(req):
    if req['op'].startswith('files-'):return files.operate(req)
    if req['op']=='terminal':
        prepared=capture.long_path(req['prepared']);old=json.loads(capture.read_safe(prepared/'corpus.json',file_limit=4*1024*1024))
        try:
            _,chain,entries,excluded,revision=inventory(old['project'])
            state='unchanged' if revision==old['revision'] and json.dumps(chain)==json.dumps(old['rootChain']) else 'changed'
        except (capture.Refusal,OSError):state='unknown'
        return {'sourceState':state,'observedAt':now()}
    if req['op'] not in ('capture','revalidate'):raise capture.Refusal('OPERATION')
    folder=capture.long_path(req['folder']);capture.inspect_chain(folder)
    root,chain,entries,excluded,revision=inventory(req['project'])
    if not entries:raise capture.Refusal('NO_CODE_SOURCES')
    if req['op']=='capture':
        mirror=folder/'mirror';mirror.mkdir(exist_ok=False)
        for entry,raw in entries:
            target=mirror/entry['relativePath'];target.parent.mkdir(parents=True,exist_ok=True)
            with target.open('xb') as output:output.write(raw)
    grant=files.publish(folder,root,'corpus',revision,[{k:v for k,v in e.items() if k not in ('relativePath','lineCount')} for e,b in entries])
    receipt={'project':capture.display_path(root),'rootChain':chain,'revision':revision}
    (folder/'corpus.json').write_text(json.dumps(receipt),encoding='utf-8')
    return {'rootPath':capture.display_path(root),'rootIdentity':grant['rootIdentity'],'revision':revision,'observedAt':now(),'sources':grant['sources'],'corpus':[{'relativePath':e['relativePath'],'sha256':e['sha256'],'lineCount':e['lineCount'],'kind':'file'} for e,b in entries],'excluded':excluded,'receiptSha':capture.sha((folder/'files.json').read_bytes())}
def main():
    request = json.loads(sys.argv[-1])
    try:
        print(json.dumps(operate(request), ensure_ascii=False))
    except capture.Refusal as error:
        if request.get('op') in ('capture','revalidate') and error.code in {
            'DEPTH_LIMIT', 'INVENTORY_LIMIT', 'SOURCE_COUNT_LIMIT',
            'SOURCE_TOTAL_LIMIT', 'FILE_LIMIT', 'NO_CODE_SOURCES'
        }:
            print(json.dumps({'error': error.code}))
            sys.exit(2)
        print(json.dumps({'error': str(error)}))
        sys.exit(1)
    except BaseException as error:
        print(json.dumps({'error': str(error)}))
        sys.exit(1)
if __name__=='__main__':main()
