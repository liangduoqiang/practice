const fs = require('fs')
const path = require('path')
const tagPath = path.resolve(__dirname, '../dist')

module.exports = class MyPlugin {
    constructor() {
    
    }
    
    apply(compiler) {
        compiler.hooks.done.tap('MyPlugin', params => {
            const assets = params.compilation.assets
            
            for (let k in assets) {
                fs.readFile(`${ tagPath }/${ k }`, 'utf-8', (error, content) => {
                    if (error) return console.log(error)
                    
                    if (k.includes('.js')) {
                        content = `/* update ${ Date.now() } */\n${ content }`
    
                        fs.writeFile(`${ tagPath }/${ k }`, content, 'utf-8', () => {
                            console.log('writeFile success')
                        })
                    }
                })
            }
        })
    }
}
