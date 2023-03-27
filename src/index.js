import {initMixin} from './init'
import { initLifeCycle } from './lifecycle'
import { initStateMixin } from './state'
function Vue(options){
  this._init(options) // 默认调用了_init方法
}

initMixin(Vue) // 引入init方法 分文件管理各个初始化方法
initLifeCycle(Vue)

initStateMixin(Vue)

export default Vue





/**
 * 1.将数据先处理成响应式  initState（针对对象来说主要是增加defineProperty 针对数组就是重写方法）
 * 2.模板编译：将模板先转换成ast语法树，将ast语法树生成**render**方法
 * 3.调用render函数 会进行取值操作 产生对应的虚拟DOM render(){_c('div',null,_v(name))} 触发get方法
 * 4.将虚拟DOM渲染成真实DOM
 */

// 1. 观察者模式 依赖收集
/**
 * 给模板中的属性 增加一个收集器
 * 页面渲染的时候 我们将渲染逻辑封装到watcher中， vm._update(vm._render())
 * 让dep记住这个watcher即可，稍后属性变化了 可以找到对应的dep中存放的watcher进行重新渲染
 */
// 2. 异步更新策略
// 3. mixin的实现原理