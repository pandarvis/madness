import os, pathlib, sys, json
root = pathlib.Path(sys.argv[1]); results = []
for prefix, name in [('', 'plain-rename'), ('\\?\\', 'extended-rename')]:
    a = root / name; b = root / (name+'-done')
    src = str(a) if not prefix else '\\\\?\\'+str(a)
    dst = str(b) if not prefix else '\\\\?\\'+str(b)
    try:
        os.mkdir(src); os.rename(src, dst); os.rmdir(dst)
        results.append({'case':name,'result':'ok'})
    except Exception as error:
        results.append({'case':name,'error':str(error),'src':src,'dst':dst})
print(json.dumps(results))
