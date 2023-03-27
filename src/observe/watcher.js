import Dep from "./dep"

// 每个属性有一个dep（属性就是被观察者），watcher就是观察者（属性变化了会通知观察者来更新）-> 观察者模式

let id = 1
class Watcher{
  constructor(vm,exprOrFn,options,cb){
    this.id = id++

    if(typeof exprOrFn === 'function'){
      this.getter = exprOrFn
    }else {
      this.getter = function(){
        let path = exprOrFn.split('.')
        let obj = vm
        for (let i = 0; i < path.length; i++) {
          obj = obj[path[i]]
        }
        return obj
      }
    }
    this.renderWatcher = options // 标记是一个渲染watcher
    this.deps = [] // 实现计算属性或者 卸载组件清理等用到
    this.depsId = new Set()
    this.lazy = options.lazy
    this.dirty = this.lazy
    this.cb = cb
    this.vm = vm
    this.user = options.user
    this.value = this.lazy ? undefined : this.get()
  }
  evalute(){
    this.value = this.get()
    this.dirty = false
  }
  get(){
    // Dep.target = this // 静态属性就是只有一份
    // this.getter() // 回去vm上取值 vm._update(vm_render())取name和age
    // Dep.target = null
    pushTarget(this)
    const value = this.getter.call(this.vm)
    popTarget()
    return value
  }
  addDep(dep){
   let id = dep.id
   if(!this.depsId.has(id)){ // 去重操作 重复属性不会多次收集
    this.deps.push(dep)
    this.depsId.add(id)
    dep.addSub(this)// watcher 已经记住dep且去重，此时让dep记住watcher
   }
  }
  depend(){
    let i = this.deps.length
    while(i--){
      // 让计算属性watcher 也收集渲染watcher
      this.deps[i].depend()
    }
  }
  update(){
    // this.run() 把当前的watcher都暂存起来
    if(this.lazy){
      this.dirty = true
    }else{
      queueWatcher(this)
    }
  }
  run(){
    const oldVal = this.value // 重新渲染
    const newVal = this.get() // 重新渲染
    this.value = newVal
    if(this.user){
      this.cb.call(this,newVal,oldVal)
    }
  }
}
export default Watcher

let stack = []
function pushTarget(watcher){
  Dep.target = watcher
  stack.push(watcher)
}
function popTarget(){
  stack.pop()
  Dep.target = stack[stack.length-1]
}


let queue = []
let has ={}
let pending = false // 防抖
function flushSchedulerQueue(){
  const flushQueue = queue.slice()
  queue = []
  has = {}
  pending = false
  flushQueue.forEach(q=>q.run())
}
function queueWatcher(watcher){
  const id = watcher.id
  if(!has[id]){
    queue.push(watcher)
    has[id] = id
    // 不管upDate执行多少次 但是最终只执行一轮刷新操作 
    if(!pending){
      nextTick(flushSchedulerQueue, 0);
      pending = true
    }
  }
}


// 多次执行 ->一次执行 实现方式 变量+异步
let callbacks = []
let waiting = false
function flushCallbacks(){
  waiting = false
  const cbs = callbacks.slice()
  callbacks = []
  cbs.forEach(cb=>cb()) // 按照顺序依次执行
}
// nextTick没有直接使用某个api 而是采用优雅降级的方式
// 内部先采用的是promise（ie不兼容）  MutationObserver(h5的api) 可以考虑ie专享的setImmediate  setTimeout
let timerFn = null
if(Promise){
  timerFn = ()=>{
    Promise.resolve().then(flushCallbacks)
  }
}else if(MutationObserver){
  let observer = new MutationObserver(flushCallbacks)
  let textNode = document.createTextNode(1)
  observer.observe(textNode,{
    characterData:true
  })
  timerFn = ()=>{
    textNode.textContent = 2
  }
}else if(setImmediate){
  timerFn = setImmediate(flushCallbacks);
}else{
  timerFn = setTimeout(flushCallbacks);
}
export function nextTick(cb){
  callbacks.push(cb)
  if(!waiting){
    timerFn()
    // (()=>{
    //   flushCallbacks() // 最后一起刷新
    // }, 0);
    waiting = true
  }
}