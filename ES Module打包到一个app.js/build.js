const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const babel = require('@babel/core')

// 获取模块信息
function getModuleInfo(file) {
    // 读取文件
    const body = fs.readFileSync(file, 'utf-8')
    
    // 转化为AST语法树
    const ast = parser.parse(body, {
        sourceType: 'module' // 表示解析的模块是ES模块
    })
    
    // 收集依赖
    const deps = {}
    traverse(ast, {
        ImportDeclaration({ node }) {
            const dirname = path.dirname(file)
            const sourceVal = node.source.value
            const abspath = './' + path.join(dirname, sourceVal)
            deps[sourceVal] = abspath
        }
    })
    
    // ES6 => ES5
    const { code } = babel.transformFromAst(ast, null, {
        presets: ['@babel/preset-env']
    })
    const moduleInfo = { file, deps, code }
    console.log(moduleInfo)
    return moduleInfo
}

// 模块解析
function parseModules(file) {
    const entry = getModuleInfo(file)
    const temp = [entry]
    const depsGraph = {}
    
    getDeps(temp, entry)
    
    temp.forEach(moduleInfo => {
        depsGraph[moduleInfo.file] = {
            deps: moduleInfo.deps,
            code: moduleInfo.code
        }
    })
    
    return depsGraph
}

// 获取依赖
function getDeps(temp, { deps }) {
    Object.keys(deps).forEach(key => {
        const child = getModuleInfo(key)
        temp.push(child)
        getDeps(temp, child)
    })
}

function bundle(file) {
    const depsGraph = JSON.stringify(parseModules(file));
    return `(function (graph) {
                 function require(file) {
                     function absRequire(relPath) {
                        return require(graph[file].deps[relPath])
                     }
                     var exports = {};
                     (function (require,exports,code) {
                        eval(code)
                     })(absRequire,exports,graph[file].code)
                     return exports
                 }
                 require('${ file }')
          })(${ depsGraph })`
}

const content = bundle('./src/index.js')

!fs.existsSync('./dist') && fs.mkdirSync('./dist')
fs.writeFileSync('./dist/app.js', content)