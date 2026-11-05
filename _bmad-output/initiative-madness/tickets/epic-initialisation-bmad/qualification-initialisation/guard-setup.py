"""Private qualification wrapper. Normal setup argv; audit hook is not an OS sandbox."""
import sys, os, json, pathlib, runpy
config_path, script, *arguments = sys.argv[1:]
config = json.loads(pathlib.Path(config_path).read_text(encoding='utf-8'))
roots = [os.path.normcase(os.path.realpath(os.path.abspath(p))) for p in config['writeRoots']]
events = []
def check(value, event):
    if isinstance(value, int):
        return
    path = os.path.normcase(os.path.realpath(os.path.abspath(os.fsdecode(value))))
    if path.startswith('\\\\?\\'):
        path = path[4:]
    if not any(os.path.commonpath((root, path)) == root for root in roots):
        raise RuntimeError('MUTATION_OUTSIDE_PRIVATE_ROOT:' + event + ':' + path)
    for parent in (pathlib.Path(path), *pathlib.Path(path).parents):
        if parent.is_symlink():
            raise RuntimeError('LINK_REFUSED:' + str(parent))
    events.append({'op': event, 'path': path})
def audit(event, args):
    if event == 'open':
        mode, flags = args[1:3]
        if (isinstance(mode, str) and any(c in mode for c in 'wa+')) or (isinstance(flags, int) and flags & (os.O_WRONLY | os.O_RDWR | os.O_CREAT | os.O_TRUNC | os.O_APPEND)):
            check(args[0], event)
    elif event in ('os.mkdir', 'os.remove', 'os.rmdir', 'os.chmod', 'os.utime'):
        check(args[0], event)
    elif event in ('os.rename', 'os.link'):
        check(args[0], event); check(args[1], event)
    elif event == 'os.symlink':
        check(args[1], event)
    elif event.startswith(('socket.', 'subprocess.')) or event in ('os.system', 'os.spawn'):
        events.append({'refused': event})
        raise RuntimeError('QUALIFIER_DENIES_' + event)
sys.addaudithook(audit)
sys.argv = [script, *arguments]
try:
    runpy.run_path(script, run_name='__main__')
finally:
    pathlib.Path(config['events']).write_text(json.dumps(events, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')


