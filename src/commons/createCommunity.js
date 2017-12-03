class Community {
  constructor (data) {
    this.key = ''
    this.nodes = new Map()
    this.nodesArr = []
    this.links = new Map()
    this.linksArr = []
    this.nodesLen = 0
    this.linksLen = 0
    this.community = new Map() // delta Q
    this.originComm = new Map()
    this.currentQ = {key1: '', key2: '', value: -Infinity} // H
    this.maxQ = 0 // Q
    this.setData(data)
  }
  setData (data) {
    this.key = data.key || ''
    this.nodesArr = data.values || {}
    this.links = data.links || {}
    this.linksArr = data.linksArr || []
    this.nodesLen = data.valueLen
    this.linksLen = data.linkLen
  }
  initCommunity () {
    let nodes = this.nodesArr
    let links = this.links
    let community = new Map()
    let originComm = new Map()
    let linksLen = this.linksLen
    // init community
    nodes.forEach(function (value) {
      value.degree = 0
      let key = value.ip
      let comm = {}
      comm.key = key
      comm.linkComm = new Map()
      comm.parent = ''
      comm.spread = true
      comm.subNet = []
      comm.a = 0
      comm.e = new Map()
      comm.distQ = new Map()
      comm.visited = new Map()
      comm.sub = false
      comm.weight = 0
      comm.maxDistQ = {key: '', value: -Infinity}
      community.set(key, comm)
      originComm.set(key, comm)
    })
    // init community.community
    for (let value of links.values()) {
      let s = value.source
      let t = value.target
      // 判空
      if (!s) {
        throw new Error('cannot find link-s!')
      }
      if (!t) {
        throw new Error('cannot find link-t!')
      }
      let sip = s.ip
      let tip = t.ip
      if (s !== t) { // 不考虑自循环,有5条自循环数据
        s.degree++
        t.degree++
        let scommunity = community.get(sip)
        let tcommunity = community.get(tip)
        // 判空
        if (!scommunity) {
          throw new Error('cannot find scommunity!')
        }
        if (!tcommunity) {
          throw new Error('cannot find tcommunity!')
        }
        if (!scommunity.linkComm.get(tip)) {
          scommunity.weight++
          scommunity.visited.set(tip, false)
          scommunity.linkComm.set(tip, tcommunity)
          if (!scommunity.e.get(tip)) {
            // 统一设定相连节点间的连接权重为1
            scommunity.e.set(tip, 1)
          }
        } else {
          // 实际上的links数据有误，但不影响，需要修正数据！
          // throw new Error('dumplicated link!')
          linksLen--
        }
        if (!tcommunity.linkComm.get(sip)) {
          tcommunity.weight++
          tcommunity.visited.set(sip, false)
          tcommunity.linkComm.set(sip, scommunity)
          if (!tcommunity.e.get(sip)) {
            // 统一设定相连节点间的连接权重为1
            tcommunity.e.set(sip, 1)
          }
        } else {
          // 实际上的links数据有误，但不影响，需要修正数据！
          // throw new Error('dumplicated link!')
        }
      } else {
        // 对于出现自循环的数据，连接总数减一
        linksLen--
      }
    }
    this.community = community
    this.originComm = originComm
    this.linksLen = linksLen
  }
  initCommunityAttrs () {
    let community = this.community
    let m = this.linksLen
    for (let value of community.values()) {
      let key1 = value.key
      let weight1 = value.weight
      let maxDistQ1 = value.maxDistQ
      value.a = weight1 / (2 * m)
      let a1 = value.a
      for (let linkComm of value.linkComm.values()) {
        // 防止一条边被两次进行设置
        if (!linkComm.visited.get(key1)) {
          let key2 = linkComm.key
          let weight2 = linkComm.weight
          let e1 = value.e.get(key2)
          let e2 = linkComm.e.get(key1)
          let maxDistQ2 = linkComm.maxDistQ
          linkComm.a = weight2 / (2 * m)
          if (!e1) {
            throw new Error('cannot find e1!')
          }
          if (!e2) {
            throw new Error('cannot find e2!')
          }
          let a2 = linkComm.a
          let q1 = 2 * (e1 - a1 * a2)
          let q2 = 2 * (e2 - a1 * a2)
          value.distQ.set(key2, q1)
          linkComm.distQ.set(key1, q2)
          if (maxDistQ1.value < q1) {
            maxDistQ1.value = q1
            maxDistQ1.key = key2
          }
          if (maxDistQ2.value < q2) {
            maxDistQ2.value = q2
            maxDistQ2.key = key1
          }
          value.visited.set(key2, true)
          linkComm.visited.set(key1, true)
        }
      }
    }
  }
  findMaxQ () {
    let community = this.community
    let maxDistQ = {key1: '', key2: '', value: -Infinity}
    let len1 = 0
    let len2 = 0
    for (let value of community.values()) {
      let currentQ = value.maxDistQ
      if (maxDistQ.value < currentQ.value) {
        len1 = [...value.linkComm].length
        len2 = [...community.get(currentQ.key).linkComm].length
        if (len1 > len2 && len1 > 1) {
          maxDistQ.key1 = currentQ.key
          maxDistQ.key2 = value.key
          maxDistQ.value = currentQ.value
        } else if (len1 < len2 && len2 > 1) {
          maxDistQ.key1 = value.key
          maxDistQ.key2 = currentQ.key
          maxDistQ.value = currentQ.value
        }
      }
    }
    this.maxQ += maxDistQ.value
    return maxDistQ
  }
  combineComm (maxDistQ) {
    let community = this.community
    let keyi = maxDistQ.key1
    let keyj = maxDistQ.key2
    let jcommunity = community.get(keyj)
    let icommunity = community.get(keyi)
    if (!jcommunity) {
      console.log(maxDistQ)
      console.log('wrong keyj', keyj)
      if (!icommunity) {
        console.log('wrong keyi', keyi)
        throw new Error('cannot find maxDistQ key1 and key2!')
      }
      throw new Error('cannot find maxDistQ key2!')
    }
    if (!icommunity) {
      console.log(keyi)
      throw new Error('cannot find maxDistQ!')
    }
    // combine icommunity to jcommunity
    jcommunity.subNet.push(icommunity)
    icommunity.parent = jcommunity.key
    icommunity.spread = false
    community.delete(keyi)
    icommunity.sub = true
    // delete community attrs having connection with icommunity
    for (let comm of icommunity.linkComm.values()) {
      comm.linkComm.delete(keyi)
      comm.e.delete(keyi)
      comm.distQ.delete(keyi)
      comm.visited.delete(keyi)
      // update comm.maxDistQ
      if (keyi === comm.maxDistQ.key) {
        let maxDistQ = {key: '', value: -Infinity}
        for (let [name, q] of comm.distQ.entries()) {
          if (q > maxDistQ.value) {
            maxDistQ.value = q
            maxDistQ.key = name
          }
        }
        comm.maxDistQ = maxDistQ
      }
    }
    // update community attrs having connection with jcommunity
    // update j row
    for (let [key, comm] of jcommunity.linkComm.entries()) {
      let q1 = jcommunity.distQ.get(key) - (2 * comm.a * icommunity.a)
      let q2 = comm.distQ.get(keyj) - (2 * comm.a * icommunity.a)
      comm.distQ.set(keyj, q2)
      jcommunity.distQ.set(key, q1)
      // update comm.maxDistQ.value
      if (keyj === comm.maxDistQ.key) {
        comm.maxDistQ.value = comm.distQ.get(keyj)
      } else if (comm.maxDistQ.value < comm.distQ.get(keyj)) {
        comm.maxDistQ.key = keyj
        comm.maxDistQ.value = comm.distQ.get(keyj)
      }
    }
    if (jcommunity.maxDistQ.value === -Infinity) {
      console.log('jcommunity cannot set maxQ', [...jcommunity.linkComm].length)
      throw new Error('cannot set correct maxq to jcommunity!')
    }
    jcommunity.a += icommunity.a
    icommunity.a = 0
  }
  main () {
    this.initCommunity()
    this.initCommunityAttrs()
    let maxDistQ = {}
    maxDistQ = this.findMaxQ()
    while (maxDistQ.value !== -Infinity) {
      this.combineComm(maxDistQ)
      maxDistQ = this.findMaxQ()
    }
  }
}

function createCommunity (data) {
  let community = new Community(data)
  community.main()
  return {community: community.community, originComm: community.originComm}
}

export default createCommunity
