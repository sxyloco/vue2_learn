import { compileToFunctions } from "./parse"

export const compileToFunction = function(template){
  let ast = compileToFunctions(template)
  return ast
}