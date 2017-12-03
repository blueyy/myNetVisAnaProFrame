class Port {
  constructor (data) {
    this.port = new Map()
    this.setData(data)
  }
  setData (data) {
    let port = new Map()
    data.forEach(function (item) {
      if (item.port && item.flag) {
        let pvalue = {}
        let pkey = item.port
        for (let key in item) {
          pvalue[key] = item[key]
        }
        port.set(pkey, pvalue)
      } else {
        throw new Error('port data need port and flag!')
      }
    })
    this.port = port
  }
}

function createPort () {
  let data = require('../assets/data/port.json')
  let p = new Port(data)
  let originPort = p.port
  let port = new Map()
  let color = [ '#0099cc', '#333399', '#33cc33', '#666666', '#6666cc', '#996699', '#99cc00', '#99cc66', '#99cccc', '#99ccff', '#cc6699', '#cc9966', '#cc9999', '#cccc00' ]
  // create port
  let i = 1
  port.set('other', {port: 'other', color: color[0], count: 0, filelen: 0, flag: 1})
  for (let value of originPort.values()) {
    let key = value.port
    let data = {}
    for (let key in value) {
      data[key] = value[key]
    }
    if (value.flag === '1') {
      data.color = color[i]
      port.set(key, data)
      i++
    } else {
      port.get('other').count++
      port.get('other').filelen += value.filelen
    }
  }
  return port
}

export default createPort
