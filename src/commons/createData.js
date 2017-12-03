class Data {
  constructor (data) {
    this.data = data
    this.timeMap = new Map()
    this.setMap(data)
  }
  setMap (data) {
    let map = new Map()
    data.forEach(function (d) {
      let key = (new Date(d.starttime)).getTime()
      d.starttime = key
      if (!map.get(key)) {
        let time = {}
        time.time = key
        time.value = []
        time.value.push(d)
        map.set(key, time)
      } else {
        map.get(key).value.push(d)
      }
    })
    this.timeMap = map
  }
}

function createData () {
  let data = require('../assets/data/day073123080101.json')
  let result = new Data(data)
  return result
}

export default createData
