import {runHelpSourcesCase} from '../../../../../../tests/helpers/help-native.mjs'
const source=String.raw`import json,os,sys
from pathlib import Path
import capture,files
root=capture.long_path(sys.argv[1]);path=root/'stamp.md';path.write_bytes(b'NORMAL GRANTED BYTES')
entry=files.record(path,'source',b'NORMAL GRANTED BYTES');fd=os.open(path,os.O_RDONLY|os.O_BINARY)
try:
    opened=os.fstat(fd);opened_stamp=[*capture.identity(opened),opened.st_size,opened.st_mtime_ns,opened.st_ctime_ns]
    print(json.dumps({'expected':entry['stamp'],'opened':opened_stamp,'differences':[{'index':i,'expected':a,'opened':b} for i,(a,b) in enumerate(zip(entry['stamp'],opened_stamp)) if a!=b],'chainEqual':json.dumps(capture.inspect_chain(path))==json.dumps(entry['chain']),'lstat':str(path.lstat()),'fstat':str(opened),'birthtime_ns':[getattr(path.lstat(),'st_birthtime_ns',None),getattr(opened,'st_birthtime_ns',None)]}))
finally:os.close(fd)
`
const result=await runHelpSourcesCase(source);console.log(JSON.stringify(result,null,2))
