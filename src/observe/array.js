let oldArrayProto = Array.prototype
export let newArrayProto = Object.create(oldArrayProto)

const methods = ['pop','push','unshift','shift','reverse','sort','splice']

methods.forEach(method=>{
  newArrayProto[method] = function(...args){
    const result = oldArrayProto[method].call(this,...args)
    let inserted;
    let ob = this.__ob__;
    switch (method) {
      case 'push':
      case 'pop':
        inserted = args
        break;
      case 'splice':
        inserted = args.slice(2)
        break;
      default:
        break;
    }
    // 数组方法添加进来的值
    if(inserted){
      ob.observerArray(inserted)
    }
    ob.dep.notify()
    // console.log('更新了!');
    return result
  }
})
