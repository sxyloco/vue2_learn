import {newArrayProto} from './array'
import Dep from './dep'
class Observer{
  constructor(data){
    this.dep = new Dep() // 专门为数组设计 或者对象新增属性
    Object.defineProperty(data,'__ob__',{
      value:this,
      enumerable:false
    })
    // 只能劫持已经存在的属性（添加了$set ,  $delete一些api
    if(Array.isArray(data)){
      // 处理数组类型
      data.__proto__ = newArrayProto
      this.observerArray(data)
    }else{
      this.walk(data)
    }
  }
  // 重新定义各个属性 循环处理 性能差
  walk(data){
    Object.keys(data).forEach(key => defineReactive(data,key,data[key]));
  }
  observerArray(data){
    data.forEach(item=>observe(item))
  }
}
function dependArray(data){
  for (let i = 0; i < data.length; i++) {
    let current = data[i]
    current.__ob__ && current.__ob__.dep.depend() // 收集数组的依赖
    if(Array.isArray(current)){ // 如果内部还是数组
      dependArray(current) // 递归收集依赖
    }
  }
}
export function defineReactive(target,key,value){
  let childOb = observe(value) // 深层结构对象 递归 拦截处理  性能差
  let dep = new Dep()
  Object.defineProperty(target,key,{
    get(){ // 取值走get
      if(Dep.target){
        dep.depend()
        if(childOb){
          childOb.dep.depend()
          if(Array.isArray(value)){
            dependArray(value)
          }
        }
      }
      return value
    },
    set(newVal){ // 赋值走set
      if(newVal === value)return
      observe(newVal)
      value = newVal
      dep.notify()
    }
  })
}
export function observe(data){
  if(typeof data !== 'object' || data == null){
    return
  }
  // 如果一个对象被劫持过了，就不需要被劫持了（要判断一个对象是否被劫持过，可以添加一个实例，用实例来判断）
  if(data.__ob__ instanceof Observer){
    return data.__ob__
  }
  return new Observer(data)
}