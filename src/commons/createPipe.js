class Pipe {
  constructor (data) {
    this.pipe = new Map()
    this.setData(data)
  }
  setData (data) {
    let pipe = new Map()
    data.forEach(function (item) {
      if (item.vpi1 && item.vci1 && item.atm1aaltype) {
        let pvalue = {}
        let pkey = item.vpi1 + '-' + item.vci1
        for (let key in item) {
          pvalue[key] = item[key]
        }
        pipe.set(pkey, pvalue)
      } else {
        console.log(item)
        throw new Error('pipe data need vpi1, vci1 and atm1aaltype!')
      }
    })
    this.pipe = pipe
  }
}

function createPipe () {
  let data = require('../assets/data/pipe.json')
  let p = new Pipe(data)
  let originPipe = p.pipe
  let pipe = new Map()
  let color = [ '#000000', '#0000ff', '#6699cc', '#006633', '#006699', '#009966', '#009999', '#0099cc', '#3366cc', '#339999', '#663366', '#6666ff', '#669966', '#66cccc', '#990033', '#990066', '#999900', '#999966', '#99cc00', '#99cc99', '#99ccff', '#cc0033', '#cc3333', '#cc6699', '#cc9999', '#cc99cc', '#cccccc', '#ccccff', '#339933', '#669999', '#ff0033', '#ff3399', '#ff6666', '#ff9900', '#ff9999', '#ff99cc', '#ffcc00', '#ffcc55', '#ffcc99', '#ffcccc', '#ffccff', '#66cc99', '#003399', '#999933' ]
  let i = 0
  for (let value of originPipe.values()) {
    let key = value.vpi1 + '-' + value.vci1
    let data = {}
    for (let key in value) {
      data[key] = value[key]
    }
    data.pipe = key
    data.color = color[i]
    i++
    pipe.set(key, data)
  }
  return pipe
}

export default createPipe
