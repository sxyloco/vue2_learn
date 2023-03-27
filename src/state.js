import Dep from "./observe/dep"
import { observe } from "./observe/index"
import Watcher, { nextTick } from "./observe/watcher"

export function initState(vm){
  // props data ...
  const opts = vm.$options
  if(opts.data){
    initData(vm)
  }
  if(opts.computed){
    initComputed(vm,opts.computed)
  }
  if(opts.watch){
    initWatch(vm,opts.watch)
  }
}
function proxy(vm,target,key){
  Object.defineProperty(vm,key,{
    get(){
      return vm[target][key]
    },
    set(newVal){
      vm[target][key] = newVal
    }
  })
}
function initData(vm){
  let data = vm.$options.data
  data = typeof data === 'function' ? data.call(vm) : data
  vm._data = data
  observe(data)

  Object.keys(data).forEach(key=>{
    proxy(vm,'_data',key)
  })
}
function initComputed(vm,computed){
  const watchers = vm._computedWatchers = {}
  for (const key in computed) {
    if (Object.hasOwnProperty.call(computed, key)) {
      const userDef = computed[key];
      const fn = typeof userDef === 'function' ? userDef : userDef.get
      watchers[key] = new Watcher(vm,fn,{lazy:true})
      defineComputed(vm,key,userDef)
    }
  }
}
function defineComputed(target,key,userDef){
  const setters =  userDef.set || (()=>{})
  // 通过实例拿到对应的属性
  Object.defineProperty(target,key,{
    get: createComputedGetter(key),
    set: setters
  })
}
// 主要用来检测是否需要执行这个getter
function createComputedGetter(key){
    return function(){
      const watcher = this._computedWatchers[key]
      if(watcher.dirty){
        // 如果是脏的 就去执行用户传入的函数
        watcher.evalute()
      }
      // 计算属性出战后 还有渲染watcher 应该让计算属性watcher里面的属性也去收集一下 渲染watcher
      if(Dep.target){
        watcher.depend()
      }
      return watcher.value
    }
}

// 这里涉及了watch的三种写法,
// 1.值是对象、2.值是数组、
// 3.值是字符串 （如果是对象可以传入一些watch参数），最终会调用vm.$watch来实现。
function initWatch(vm,watch){
  for (const key in watch) {
    if (Object.hasOwnProperty.call(watch, key)) {
      const handler = watch[key];
      // 字符串  数组  函数
      if(Array.isArray(handler)){
        for (let i = 0; i < handler.length; i++) {
          createWatcher(vm,key,handler[i])
        }
      }else {
        createWatcher(vm,key,handler)
      }
     
    }
  }
}
function createWatcher(vm,key,handler){
  let options = {}
  // 字符串
  if(typeof handler === 'string'){
    handle = vm[handle] // ob
  }
  // 对象
  if(typeof handler ==='object' && typeof handler !== 'null'){
    handler = handler.handler // ob
    options = handler
  }
  return vm.$watch(key,handler,options)
}

export function initStateMixin(Vue){
  Vue.prototype.$nextTick = nextTick
  Vue.prototype.$watch = function(exprOrFn,ob,options){
    new Watcher(this,exprOrFn,{...options,user:true},ob)
  }
}