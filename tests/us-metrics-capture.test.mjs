import test from 'node:test'
import assert from 'node:assert/strict'
import {assertFullMetricsCapture} from '../scripts/qualification/us-metrics-capture.mjs'
test('capture frame rejects former cropped zoom and accepts complete native scaled content',()=>{
 const frame={size:[1650,1150],scale:1.25};assert.doesNotThrow(()=>assertFullMetricsCapture({width:2063,height:1438},frame));assert.doesNotThrow(()=>assertFullMetricsCapture({width:2061,height:1436},frame));assert.throws(()=>assertFullMetricsCapture({width:1031,height:719},frame),/CAPTURE_MUST_COVER_FULL_NATIVE_CONTENT/);assert.throws(()=>assertFullMetricsCapture({width:2059,height:1438},frame),/CAPTURE_MUST_COVER_FULL_NATIVE_CONTENT/)
})
