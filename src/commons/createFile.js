class File {
  constructor (data) {
    this.file = new Map()
    this.setData(data)
  }
  setData (data) {
    let file = new Map()
    data.forEach(function (item) {
      if (item.fileaffix) {
        let fvalue = {}
        let fkey = item.fileaffix
        for (let key in item) {
          fvalue[key] = item[key]
        }
        file.set(fkey, fvalue)
      } else {
        throw new Error('file data need fileaffix!')
      }
    })
    this.file = file
  }
}

function createFile () {
  let data = require('../assets/data/file.json')
  let f = new File(data)
  let originFile = f.file
  let color = [ '#0099cc', '#333399', '#33cc33', '#666666', '#6666cc', '#996699', '#99cc00', '#99cc66', '#99cccc', '#99ccff', '#cc6699', '#cc9966', '#cc9999', '#cccc00', '#cccc33', '#cccc99', '#cccccc', '#ccccff', '#ccff99', '#ccffff', '#ff6666', '#ff9900', '#ff9966', '#ffcc99', '#ffcccc', '#ffff66', '#ccff66', '#99cc99', '#009966', '#999933' ]
  let i = 0
  for (let file of originFile.values()) {
    file.color = color[i]
    i++
  }
  return originFile
}
export default createFile
