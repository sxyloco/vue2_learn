import Watcher from "./observe/watcher";
import { createElementVNode, createTextVNode } from "./vdom";


function patchProps(el,props){
  for (const key in props) {
    if (Object.hasOwnProperty.call(props, key)) {
     if(key === 'style'){
      for (const styleName in props.style) {
        el.style[styleName] = props.style[styleName]
      }
     }else{
      el.setAttribute(key,props[key])
     }
      
    }
  }
}
function createElm(vnode){
  const { tag,data,children,text } = vnode
  if(typeof tag === 'string'){
    vnode.el = document.createElement(tag)
    patchProps(vnode.el, data)
    if(children){
      children.forEach(child => {
        vnode.el.appendChild(createElm(child))
      });
    }
  }else{
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}
export function patch(oldVnode,vnode){
  const isRealElement = oldVnode && oldVnode.nodeType
  if(isRealElement){
    // 首次渲染
    const elm = oldVnode
    const parent = elm.parentNode
    let newElm = createElm(vnode)
    parent.insertBefore(newElm,elm.nextsibling)
    parent.removeChild(elm)

    return newElm
  }else{
    // diff算法
  }
}

export function initLifeCycle(Vue){
  Vue.prototype._update = function(vnode){ // 将vnode转换成真实dom
    const vm = this
    const el = vm.$el
    // patch 既有初始化的功能  又有更新的逻辑
    vm.$el = patch(el,vnode)

  }
  Vue.prototype._render = function(){
    const vm = this
    // 当渲染的时候会去实例中取值，我们可以将试属性和试图绑定在一起
    return this.$options.render.call(vm)
  }
  Vue.prototype._c = function(){
    return createElementVNode(this,...arguments)
  }
  Vue.prototype._v = function(){
    return createTextVNode(this,...arguments)
  }
  Vue.prototype._s = function(val){
    if(typeof val !== 'object') return val
    return JSON.stringify(val)
  }
}
export function mountComponent(vm,el){
  // 1. 调用 render方法产生虚拟节点 虚拟Dom
  vm.$el = el
  const updateComponent = ()=>{
    vm._update(vm._render())
  }

  const watcher = new Watcher(vm,updateComponent,true)

  // 2. 将虚拟Dom转换为真实DOM
  // 3. 插入到el元素中
}