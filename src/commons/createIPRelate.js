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
function createPeseudoNodes (originIP) {
  let originNodes = new Map()
  let peseudoNodes = new Map()
  let arrayNodes = ([...originIP.inner].concat([...originIP.outer])).concat([...originIP.reserve])
  arrayNodes.forEach(function (arr) {
    let node = arr[1]
    let key = arr[0]
    originNodes.set(key, node)
    switch (node.type) {
      case 'inner':
        node.name = node.ipa + '-' + node.ipb
        break

      case 'outer':
        node.name = node.add1
        break

      case 'reserve':
        node.name = node.add2
        break
    }
    if (!peseudoNodes.get(node.name)) {
      let value = {}
      value.name = node.name
      value.value = []
      value.value.push(node)
      peseudoNodes.set(value.name, value)
    } else {
      peseudoNodes.get(node.name).value.push(node)
    }
  })
  return {originNodes: originNodes, peseudoNodes: peseudoNodes}
}
function createPeseudoSDNodes () {
  let s = new Map()
  let t = new Map()
  let src = require('../assets/data/ip_src.json')
  let dst = require('../assets/data/ip_dst.json')
  src.forEach(function (d) {
    if (!s.get(d.name)) {
      let value = {}
      value.name = d.name
      value.value = []
      value.value.push(d)
      s.set(d.name, value)
    } else {
      s.get(d.name).value.push(d)
    }
  })
  dst.forEach(function (d) {
    if (!t.get(d.name)) {
      let value = {}
      value.name = d.name
      value.value = []
      value.value.push(d)
      t.set(d.name, value)
    } else {
      t.get(d.name).value.push(d)
    }
  })
  return {peseudoNodesS: s, peseudoNodesD: t}
}

function initIP () {
  let ip = createIP()
  let peseudoNodes = createPeseudoNodes(ip)
  let peseudoNodesSD = createPeseudoSDNodes()
  return {originIP: ip, originNodes: peseudoNodes.originNodes, peseudoNodes: peseudoNodes.peseudoNodes, peseudoNodesS: peseudoNodesSD.peseudoNodesS, peseudoNodesD: peseudoNodesSD.peseudoNodesD}
}

export default initIP
