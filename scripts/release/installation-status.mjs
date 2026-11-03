import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
const run = promisify(execFile)
const { stdout } = await run('tasklist.exe', ['/FO', 'CSV'], { timeout: 15000 })
console.log(stdout.split(/\r?\n/).filter(line => /Madness|uninst|nsis/i.test(line)).join('\n') || 'No Madness or installer process')
