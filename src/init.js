import { compileToFunction } from "./compile"
import { mountComponent } from "./lifecycle"
import { initState } from "./state"
export function initMixin(Vue){
  Vue.prototype._init = function(options){
    const vm = this
    // $options 获取用户配置
    vm.$options = options // 将用户配置挂载到实例上
    initState(vm)
    if(options.el){
      vm.$mount(options.el)
    }
  }

  Vue.prototype.$mount = function(el){
    const vm = this
    el = document.querySelector(el)
    const opts = vm.$options
    if(!opts.render){
      let template;
      if(!opts.template && el){
        template = el.outerHTML
      }else{
        if(el){
          template = opts.template
        }
      }
      if(template){
        const render = compileToFunction(template)
        opts.render = render
      }
    }
    // 页面的初步渲染，实现挂载逻辑
    mountComponent(vm,el)
  }
  
}
/**
 * vue核心流程 
 * 1）创造了响应式数据 --> Object.defineProperty 对象 数组
 * 2）模板转换成ast语法树 --> 正则匹配 while循环截取 startTag EndTag text 递归
 * 3）将ast语法树转换成render函数  -->with + new Function()
 * 4）后续每次更新可以只执行render函数（无须再次执行ast转换过程）
 * 5）render函数回去生成虚拟节点
 * 6）根据生成的虚拟节点创建真实DOM
 */

// ast做的是语法层面的转换，它描述的是语法本身 （可以描述html css js）
// 虚拟Dom 是描述dom元素，可以增加一些自定义属性 比如 事件 插槽 指令等 （描述DOM的）

