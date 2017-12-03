let maxLevel = 0
let singleMaxLevel = 300
let levelAngle = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
let levelRange = [25029, 1601, 121, 72, 366, 600, 600, 600, 600, 600, 600, 600]
class DisjointSet {
  constructor (data) {
    this.nodesMap = new Map()
    this.originalNodes = []
    this.originalLinks = []
    this.nodes = []
    this.links = []
    this.father = []
    this.connectedComp = []
    this.connectedCompMap = new Map()
    this.setData(data)
  }
  setData (data) {
    if (!data.nodes) {
      throw new Error('Empty nodes, check your original data.')
    } else if (typeof (data.nodes) === 'number') {
      let i = 0
      while (i < data.nodes) {
        let node = {id: i, belongComp: -1}
        this.originalNodes.push(node)
        i++
      }
      this.nodes = this.originalNodes
    } else if (typeof (data.nodes) === 'object') {
      let nodes = this.nodes
      this.nodesMap = data.nodesMap
      data.nodes.forEach(function (item, index) {
        let node = item
        node.belongComp = node.belongComp || -1
        nodes.push(node)
      })
    }
    let nodesMap = this.nodesMap
    let links = this.links
    this.originalLinks = data.links || []
    this.originalLinks.forEach(function (item) {
      let s = nodesMap.inner.get(item.srcip) || nodesMap.outer.get(item.srcip) || nodesMap.reserve.get(item.srcip)
      let t = nodesMap.inner.get(item.dstip) || nodesMap.outer.get(item.dstip) || nodesMap.reserve.get(item.dstip)
      if (!s || !t) {
        throw new Error('cannot find node in nodesMap!')
      }
      let sindex = s.index
      let tindex = t.index
      let link = {source: sindex, target: tindex, s: s, t: t}
      links.push(link)
    })
  }
  initFather () {
    let father = this.father
    this.nodes.forEach(function (item, index) {
      father[index] = index
    })
  }
  find (x) {
    while (this.father[x] !== x) {
      x = this.father[x]
    }
    return x
  }
  union (x, y) {
    let max = Math.max(x, y)
    let min = Math.min(x, y)
    this.father[max] = min
  }
  createFather () {
    let linksLen = this.links.length
    let links = this.links
    let nodes = this.nodes
    let father = this.father
    for (let i = 0; i < linksLen; i++) {
      let s = links[i].source
      let t = links[i].target
      let sf = this.find(s)
      let tf = this.find(t)
      if (sf !== tf) {
        this.union(sf, tf)
      }
    }
    nodes.forEach(function (item, index) {
      item.belongComp = father[index]
    })
  }
  initConnectedComp () {
    let connectedCompTemp = new Map()
    let connectedComp = []
    let nodes = this.nodes
    nodes.forEach(function (item, index) {
      let key = item.belongComp
      if (!connectedCompTemp.has(key)) {
        connectedCompTemp.set(key, [])
      }
      connectedCompTemp.get(key).push(item)
    })
    connectedCompTemp.forEach(function (value, key, map) {
      let item = { key: key, values: value, union: false }
      connectedComp.push(item)
    })
    return connectedComp
  }
  reviseConnectedComp () {
    let connectedComp = this.initConnectedComp()
    let nodes = this.nodes
    let connectedCompLen = connectedComp.length
    for (let i = 0; i < connectedCompLen; i++) {
      let belongComp = connectedComp[i].key
      let upperBelongComp = nodes[belongComp].belongComp
      if (connectedComp[i].values[0].belongComp !== upperBelongComp) {
        connectedComp[i].values.forEach(function (item, index) {
          item.belongComp = upperBelongComp
        })
        let mergeTo = connectedComp.findIndex(function (value, index, arr) {
          return value.key === upperBelongComp
        })
        connectedComp[mergeTo].values = connectedComp[mergeTo].values.concat(connectedComp[i].values)
        connectedComp[i].union = true
      }
    }
    for (let i = 0; i < connectedCompLen; i++) {
      if (connectedComp[i].union === false) {
        this.connectedComp.push(connectedComp[i])
      }
    }
    this.connectedComp.forEach(function (item, index) {
      let values = item.values
      let maxNode = {degree: -Infinity, id: -Infinity, name: ''}
      values.forEach(function (node, index) {
        if (node.degree > maxNode.degree) {
          maxNode.degree = node.degree
          maxNode.id = node.id
          maxNode.name = node.name || ''
        }
      })
      item.maxNode = maxNode
    })
  }
  keyIndexToName () {
    let nodes = this.nodes
    let comps = this.connectedComp
    let compsMap = new Map()
    comps.forEach(function (comp) {
      let key = comp.key
      let values = comp.values
      let keyname = nodes[key].ip
      comp.key = keyname
      values.forEach(function (node) {
        node.belongComp = keyname
      })
      comp.valueLen = comp.values.length
      comp.level = 0
      if (comp.valueLen > 20000) {
        comp.level = 1
      } else if (comp.valueLen >= 50 && comp.valueLen < 1000) {
        comp.level = 2
      } else if (comp.valueLen >= 5 && comp.valueLen < 50) {
        comp.level = 3
      } else if (comp.valueLen === 4) {
        comp.level = 4
      } else if (comp.valueLen === 3) {
        comp.level = 5
      } else if (comp.valueLen === 2) {
        comp.level = 5 + Math.ceil(maxLevel / singleMaxLevel)
        maxLevel++
      }
      if (comp.level < 6) {
        comp.outerRadius = (comp.level + 1) * 20
        comp.innerRadius = comp.outerRadius - 20
      } else {
        comp.outerRadius = (comp.level - 5) * 3 + 6 * 20
        comp.innerRadius = comp.outerRadius - 3
      }
      comp.startAngle = levelAngle[comp.level - 1]
      levelAngle[comp.level - 1] += (comp.valueLen / levelRange[comp.level - 1]) * Math.PI * 2
      comp.endAngle = levelAngle[comp.level - 1]
      comp.linkLen = 0
      comp.links = new Map()
      comp.linksArr = []
      compsMap.set(keyname, comp)
    })
    this.connectedCompMap = compsMap
  }
  createMapLinks () {
    let comps = this.connectedCompMap
    let links = this.links
    links.forEach(function (link) {
      let s = link.s
      let t = link.t
      if (s.belongComp !== t.belongComp) {
        throw new Error('s-belongComp is not equal to t-belongComp!')
      } else {
        let comp = comps.get(s.belongComp)
        if (!comp) {
          throw new Error(s.belongComp, 'cannot find comp!')
        }
        comp.linksArr.push({source: s, target: t})
        comp.linkLen++
        comp.links.set((s.ip + '-' + t.ip), {source: s, target: t})
      }
    })
  }
  main () {
    this.initFather()
    this.createFather()
    this.initConnectedComp()
    this.reviseConnectedComp()
    this.keyIndexToName()
    this.createMapLinks()
  }
}

function createDisjointSet (data) {
  let disjointSet = new DisjointSet(data)
  disjointSet.main()
  return {map: disjointSet.connectedCompMap, arr: disjointSet.connectedComp}
}

export default createDisjointSet
