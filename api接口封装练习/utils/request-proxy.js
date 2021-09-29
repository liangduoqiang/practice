/*
 * 架设一层代理，用于控制所有请求的行为
 *
 * 1.拦截正在请求中的重复请求
 * 2.取消已经用不到的请求
 * 3.缓存接口数据
 *
 * 第2条和第3条的配置方法: request(params, { isCancalBefor: true, isCache: true })
 * 在调用request的时候传递第二个config参数
 *
 * requestProxy({
 *     target: service, // 代理的请求函数
 *     cacheMaxLength: 20 // 最大缓存接口数
 * })
 * */

const proxy = ({ target, cacheMaxLength = 20 }) => {
    
    if (!(target && target instanceof Function)) return
    
    const handler = {
        keys: new Map(), // 所有请求中的接口
        caches: new Map(), // 所有接口的缓存数据
        cacheMaxLength: cacheMaxLength, // 最大缓存接口数
        
        apply (target, thisArg, argArray) {
            const params = argArray[0]
            const config = argArray[1] || {} // 调用request的第二个参数
            const key = JSON.stringify(params)
            const paramUrl = params.url
            const mapKeys = this.keys
            
            // 防止重复请求
            if (!mapKeys.has(key)) {
                
                // 如果是缓存接口并且有缓存数据，就直接把数据返回
                const isCache = config.isCache
                const mapCaches = this.caches
                const cacheData = isCache ? mapCaches.get(key) : null
                
                if (cacheData) {
                    return Promise.resolve(cacheData)
                }
                
                // 处理取消请求
                let value
                if (config.isCancalBefor) {
                    const source = axios.CancelToken.source()
                    
                    // 把cancel promise实例传递下去
                    params.cancelToken = source.token
                    
                    // 绑定当前取消函数 和 url
                    value = {
                        cancel: source.cancel,
                        url: paramUrl
                    }
                    
                    // 取消所有接口请求
                    for (let [k, {url, cancel}] of mapKeys) {
                        // cancel && cancel('cancel: ' + paramUrl) // 前面的一律取消
                        url === paramUrl && cancel('cancel: ' + paramUrl) // 取消之前相同地址的请求
                    }
                }
                
                // 添加当前项
                mapKeys.set(key, value)
                
                // 发起请求
                const pormise = Reflect.apply(target, thisArg, [params])
                
                // 缓存接口数据
                isCache && pormise.then(data => {
                    // const isResponseDataValid = false // TODO 响应的数据是否有效
                    // if (!isResStatusSuccess) return
                    
                    mapCaches.set(key, data)
    
                    // 维护最大缓存数
                    if (mapCaches.size > this.cacheMaxLength) {
                        const [lastKey] = [...mapCaches.keys()]
                        mapCaches.delete(lastKey)
                    }
                })
                
                // 接口请求完毕之后删除对应项
                pormise.finally(() => mapKeys.delete(key))
                
                return pormise
            }
            
            // 处理重复请求
            else {
                const errorMessag = 'Repeat request: ' + paramUrl
                
                return Promise.reject(errorMessag)
            }
        }
    }
    
    return new Proxy(target, handler)
}

export default proxy
