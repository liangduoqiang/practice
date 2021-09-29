import requestProxy from '../utils/request-proxy.js'

const service = axios.create({  })

export default requestProxy({ target: service })


