
// rollup默认可以导出一个对象 作为打包的配置文件
import babel from 'rollup-plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
export default {
  input: './src/index.js', // 入口
  output: {
    file:'./dist//vue.js',
    name:'Vue', // global.vue
    format:'umd',// esm es6模块 common.js  iife自执行函数  umd
    sourcemap:true,
  },
  plugins:[
    babel({
      exclude:'node_modules/**' // 排除node_modules下的所有文件
    }),
    resolve()
  ]
}
