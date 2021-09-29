import service from './service.js'
import { api } from '../api/index.js'

for (let [ moduleName, moduleValue ] of Object.entries(api)) {
    api[moduleName] = proxy(moduleValue)
}

function proxy(target) {
    return new Proxy(target, {
        get(target, key) {
            return function(data = {}, config = {}) {
                const { url, method } = target[key]

                return service({ url, method, data }, config)
            }
        }
    })
}

export { api }
