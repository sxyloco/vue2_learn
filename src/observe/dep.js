let id = 0 
class Dep {
  constructor(){
    this.id = id++
    this.subs = [] // 存放当前属性对应的那些watcher
  }
  depend(){
    // 这里不希望放相同的watcher，而且dep与watcher是双向的 多对多的关系
    // this.subs.push(Dep.target) Dep.target->watcher
    // watcher 记录dep
    Dep.target.addDep(this) // 让watcher记住dep  创造双向的关系
    // dep 和 watcher是一个多对多的关系 （一个属性可以在多个组件中使用 de->多个watcher）
    // 一个组件中有多个属性组成（一个watcher对应多个dep）
  }
  addSub(watcher){
    this.subs.push(watcher)
  }
  notify(){
    this.subs.forEach(watcher=>watcher.update())
  }
}
Dep.target = null
export default Dep