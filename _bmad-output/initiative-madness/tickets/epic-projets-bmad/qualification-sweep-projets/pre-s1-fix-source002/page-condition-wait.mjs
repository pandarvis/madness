/** Host-side polling for async page predicates. A timed-out evaluate is not cancelled. */
export async function waitForPageCondition(page,predicate,arg=undefined,{timeout=30000,interval=100}={}){
 if(!Number.isFinite(timeout)||timeout<=0||!Number.isFinite(interval)||interval<0)throw new RangeError('Invalid page condition deadline or interval')
 const deadline=performance.now()+timeout
 const expired=()=>Object.assign(new Error(`Page condition timed out after ${timeout}ms`),{name:'TimeoutError'})
 async function bounded(operation){
  const remaining=deadline-performance.now();if(remaining<=0)throw expired()
  let timer
  try{return await Promise.race([Promise.resolve().then(operation),new Promise((_,reject)=>{timer=setTimeout(()=>reject(expired()),remaining)})])}
  finally{clearTimeout(timer)}
 }
 for(;;){
  const value=await bounded(()=>page.evaluate(predicate,arg))
  if(performance.now()>=deadline)throw expired()
  if(value)return value
  const remaining=deadline-performance.now();if(remaining<=0)throw expired()
  await new Promise(resolve=>setTimeout(resolve,Math.min(interval,remaining)))
 }
}
