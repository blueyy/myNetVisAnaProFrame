class IP {
  constructor (inner, outer, reserve) {
    this.outer = new Map()
    this.reserve = new Map()
    this.inner = new Map()
    this.setData(inner, outer, reserve)
  }
  setData (inner, outer, reserve) {
    if (inner) {
      this.inner = this.createIP(inner, 'inner', 0)
    }
    if (outer) {
      outer.forEach(function (item) {
        if (!item.add) {
          item.add = item.add1
        }
      })
      this.outer = this.createIP(outer, 'outer', inner.length)
    }
    if (reserve) {
      this.reserve = this.createIP(reserve, 'reserve', inner.length + outer.length)
    }
  }
  createIP (data, type, start) {
    let map = new Map()
    data.forEach(function (item, index) {
      if (item.ip) {
        let value = {}
        let ip = item.ip
        for (let key in item) {
          value[key] = item[key]
        }
        value.index = index + start
        value.type = type
        map.set(ip, value)
      } else {
        throw new Error('ip data need ip!')
      }
    })
    return map
  }
}

function createIP () {
  let inner = require('../assets/data/ip_inner.json')
  let outer = require('../assets/data/ip_outer.json')
  let reserve = require('../assets/data/ip_reserve.json')
  let ip = new IP(inner, outer, reserve)
  return {inner: ip.inner, outer: ip.outer, reserve: ip.reserve}
}

export default createIP
