import test from 'node:test'
import assert from 'node:assert/strict'
import {metricsLabels} from '../src/renderer/src/strings.ts'
test('Q3 all measurement copy keys have nonempty paired FR and EN values',()=>{
 const {fr,en}=metricsLabels;assert.deepEqual(Object.keys(fr).sort(),Object.keys(en).sort())
 for(const [language,values]of Object.entries(metricsLabels))for(const [key,value]of Object.entries(values))assert.ok(typeof value==='string'&&value.trim(),language+':'+key)
 for(const key of ['knownTurn','knownTurns','missingAck','functionalOutcome','methodBounds','methodScope','methodSource','storageUnconfirmed','noOccurrences','contextMismatch','adjustmentPending','proofDetails'])assert.notEqual(fr[key],en[key],key)
})
