class Link {
  constructor (data) {
    this.link = new Map()
    this.setData(data)
  }
  setData (data) {
    let link = new Map()
    data.forEach(function (item) {
      if (item.srcip && item.dstip) {
        let lvalue = {}
        let lkey = item.srcip + '-' + item.dstip
        for (let key in item) {
          lvalue[key] = item[key]
        }
        link.set(lkey, lvalue)
      } else {
        throw new Error('link data need srcip and dstip!')
      }
    })
    this.link = link
  }
}

function createLink () {
  let data = require('../assets/data/directlink.json')
  let l = new Link(data)
  return l.link
}

export default createLink
