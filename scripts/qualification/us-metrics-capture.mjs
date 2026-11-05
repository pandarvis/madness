import assert from 'node:assert/strict'
/** Attest the entire native content frame, including zoom and Windows DPI scaling. */
export function assertFullMetricsCapture(pixels,frame){
 assert.ok(Number.isFinite(frame.scale)&&frame.scale>0&&frame.size.length===2&&frame.size.every(n=>Number.isFinite(n)&&n>0),'INVALID_NATIVE_FRAME')
 assert.ok(Number.isInteger(pixels.width)&&Number.isInteger(pixels.height)&&pixels.width>0&&pixels.height>0,'INVALID_CAPTURE_PIXELS')
 assert.ok(Math.abs(pixels.width-frame.size[0]*frame.scale)<=2&&Math.abs(pixels.height-frame.size[1]*frame.scale)<=2,'CAPTURE_MUST_COVER_FULL_NATIVE_CONTENT')
}
