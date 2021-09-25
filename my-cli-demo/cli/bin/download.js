const fs = require('fs')
const chalk = require('chalk')
const ora = require('ora')
const path = require('path')

module.exports = projectName => {
    const demoDirName = 'project-template'
    const basePath = path.resolve(__dirname, '../' + demoDirName)
    const targetPath = `${ process.cwd() }/${ projectName }`
    const spninner = ora(chalk.red('下载中，请稍等...'))
    
    // download-git-repo
    function download(arr) {
    
        fs.mkdirSync(targetPath)
        
        arr.forEach(item => {
            const _path = `${ targetPath }${ item[1].replace(basePath, '') }`
            
            // 如果是文件
            if (item[0] === 'file') {
                // 读取之后写入
                const content = fs.readFileSync(item[1])
                fs.writeFileSync(_path, content)
            }
            else {
                // 否则创建改文件夹
                fs.mkdirSync(_path)
            }
        })
    
        spninner.stop()
        console.log(chalk.red('模板下载成功！'))
    }
    
    function makeArr() {
        const arr = []
        
        function read(path) {
            const files = fs.readdirSync(path)
    
            files.forEach(item => {
                const curPath = `${ path }/${ item }`
                const stat = fs.statSync(curPath)
                
                const isFile = stat.isDirectory() // 是否是一个文件夹
                
                if (isFile) {
                    arr.push(['dir', curPath])
                    read(curPath)
                }
                else {
                    arr.push(['file', curPath])
                }
            })
        }
        
        read(basePath)
        return arr
    }
    
    // 执行下载
    download( makeArr() )
}