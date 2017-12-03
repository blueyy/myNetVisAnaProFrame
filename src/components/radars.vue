<template>
  <div>
    <div id='rcontent' style='width: 210px; height: 842px; float: left;'>
      <div id='rfile'></div>
      <div id='rport'></div>
      <div id='rpipe'></div>
      <div id='rall'></div>
    </div>
    <div id='rtext' style='width: 410px; height: 842px; float: left;'>
      <table>
        <thead>
          <th>
            <tr>
              <td>TIME</td>
              <td>IP</td>
              <td>FILE</td>
              <td>PORT</td>
              <td>PIPE</td>
            </tr>
          </th>
        </thead>
      </table>
      <hr/>
      <div id='rtextcontent' style='width: 410px; height: 800px; overflow-y: scroll; overflow-x: hidden;'></div>
    </div>
    </div>
  </div>
</template>

<script>
let d3 = require('d3')
export default {
  props: ['data', 'activateStep', 'maxFile', 'timeEnd', 'currTime'],
  data: function () {
    return {
      rfile: {type: 0, slen: 0, flen: 0, scount: 0, fcount: 0, valueScale: {}, originAngle: {}, num: 5},
      rpipe: {type: 0, atmType: 0, slen: 0, flen: 0, scount: 0, fcount: 0, valueScale: {}, originAngle: {}, num: 6},
      rport: {type: 0, slen: 0, flen: 0, scount: 0, fcount: 0, valueScale: {}, originAngle: {}, num: 5},
      rall: {aip: 0, afile: 0, apipe: 0, aport: 0, valueScale: {}, originAngle: {}, num: 4},
      defaultPort: [20, 21, 53, 80, 88, 135, 139, 389, 443, 445, 1025, 1433, 36100],
      level: 5, // num of circles
      radius: 70, // radar radius
      arrowLen: 10,
      width: 190,
      height: 190,
      linePath: d3.svg.line().x(function (d) { return d[0] }).y(function (d) { return d[1] }),
      colorScale: d3.scale.category10(),
      radarsCount: {count: 0},
      radarsInterval: {}
    }
  },
  methods: {
    drawRadar: function (name) {
      let level = this.level
      let radius = this.radius
      let axisLen = 15
      let arrowLen = this.arrowLen
      let arrowAngle = 0.02
      let distr = radius / (level)
      let raxis = this['r' + name]
      raxis.originAngle = new Map()
      let cx = this.width / 2
      let cy = this.height / 2
      let valueScale = d3.scale.linear()
                        .domain([0, 1])
                        .range([0, radius])
      let svg = d3.select('#rcontent').select('#r' + name).append('svg')
                  .attr('height', cx * 2)
                  .attr('width', cy * 2)
      let drag = d3.behavior.drag()
                  .on('drag', function () {
                    let x = d3.event.x
                    let oldx = d3.select(this).select('#raxis').attr('x2')
                    let y = d3.event.y
                    let oldy = d3.select(this).select('#raxis').attr('y2')
                    let acos = ((x - cx) * (oldx - cx) + (y - cy) * (oldy - cy)) / ((radius + axisLen) * Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)))
                    let angle = Math.acos(acos) * 180 / Math.PI
                    // axis rotate
                    d3.select(this).attr('transform', function () {
                      return 'rotate(' + angle + ' ' + cx + ',' + cy + ')'
                    })
                    // update axis angle in paxis
                    let classname = d3.select(this).attr('class')
                    let axisname = classname.substring(5)
                    raxis[axisname] = raxis.originAngle.get(axisname) + angle / 180 * Math.PI
                  })
      // draw circle
      for (let i = 0; i < level; i++) {
        svg.append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', distr * (i + 1))
          .attr('stroke', 'white')
          .attr('fill', 'none')
          .attr('stroke-dasharray', function () {
            if (i !== level - 1) {
              return '5, 5'
            } else {
              return 'none'
            }
          })
      }
      // draw axis
      let i = 0
      let angleUnit = Math.PI * 2 / raxis.num
      for (let key in raxis) {
        if (key === 'valueScale' || key === 'originAngle') {
          break
        }
        let angle = i * angleUnit
        raxis[key] = angle
        raxis.originAngle.set(key, angle)
        let x2 = cx + (radius + axisLen) * Math.cos(angle)
        let y2 = cy + (radius + axisLen) * Math.sin(angle)
        let ax1 = cx + (radius + arrowLen) * Math.cos(angle - arrowAngle)
        let ax2 = cx + (radius + arrowLen) * Math.cos(angle + arrowAngle)
        let ay1 = cy + (radius + arrowLen) * Math.sin(angle - arrowAngle)
        let ay2 = cy + (radius + arrowLen) * Math.sin(angle + arrowAngle)
        let g = svg.append('g')
                  .attr('class', 'r' + name + key)
        g.append('line')
          .attr('x1', cx)
          .attr('y1', cy)
          .attr('x2', x2)
          .attr('y2', y2)
          .attr('id', 'raxis')
          .attr('stroke', 'yellow')
        g.append('text')
          .attr('x', function () {
            if (angle <= 3.14) {
              return cx + (radius) * Math.cos(angle - arrowAngle)
            } else {
              return cx + (radius) * Math.cos(angle + arrowAngle)
            }
          })
          .attr('y', function () {
            if (angle <= 3.14) {
              return ay1
            } else {
              return ay2
            }
          })
          .text(key)
          .attr('font-family', 'arial')
          .attr('font-size', '3px')
          .attr('fill', 'white')
        // arrows
        g.append('line')
          .attr('x1', ax1)
          .attr('y1', ay1)
          .attr('x2', x2)
          .attr('y2', y2)
          .attr('stroke', 'steelblue')
        g.append('line')
          .attr('x1', ax2)
          .attr('y1', ay2)
          .attr('x2', x2)
          .attr('y2', y2)
          .attr('stroke', 'steelblue')
        if (key !== 'type' && key !== 'ip') {
          g.on('mouseover', function () {
            d3.select(this).selectAll('line').attr('stroke', 'orange').attr('storke-width', 5).attr('cursor', 'pointer')
            d3.select(this).selectAll('text').attr('fill', 'orange').attr('cursor', 'pointer')
          })
          .on('mouseout', function () {
            d3.select(this).selectAll('line').attr('stroke', 'steelblue').attr('storke-width', 1).attr('cursor', 'default')
            d3.select(this).selectAll('text').attr('fill', '#339933').attr('cursor', 'default')
          })
          g.call(drag)
        }
        i++
      }
      raxis.valueScale = valueScale
    },
    drawRadars: function () {
      this.drawRadar('file')
      this.drawRadar('pipe')
      this.drawRadar('port')
      this.drawRadar('all')
      d3.select('#rtextcontent').append('svg')
        .attr('width', '410px')
        .attr('height', '800px')
    },
    realTimeRenderRadars: function (timeGap) {
      let check
      if (timeGap === 1) {
        check = 1
      } else if (timeGap === 60) {
        check = 5
      } else if (timeGap === 3600) {
        check = 110
      }
      // data structure
      let data = this.data
      let timeMap = data.timeMap
      let rfile = this.rfile
      let rport = this.rport
      let rpipe = this.rpipe
      let rall = this.rall
      let fValueScale = rfile.valueScale
      let pipeValueScale = rpipe.valueScale
      let portValueScale = rport.valueScale
      let allValueScale = rall.valueScale
      let dport = this.defaultPort
      let maxFile = this.maxFile
      // rendre detail
      let radius = this.radius
      let linePath = this.linePath
      let colorScale = this.colorScale
      let cx = this.width / 2
      let cy = this.height / 2

      let compThreat = function (radar, map, name) {
        let currAngle
        let preAngle = 0
        let value
        let result = 0
        for (let key in radar) {
          if (key !== 'valueScale' && key !== 'num' && key !== 'originAngle') {
            if (key === 'type') {
              currAngle = Math.PI * 2 - radar['fcount']
              value = map.get(name)
              preAngle = 0
            } else if (key === 'aip') {
              currAngle = Math.PI * 2 - radar['aport']
              value = map.get(name)
              preAngle = 0
            } else {
              currAngle = radar[key] - preAngle
              value = map.get(key)
              preAngle = radar[key]
            }
            result += value * currAngle / (Math.PI * 2 * radius)
          }
        }
        return result
      }
      // interval
      let count = this.radarsCount
      let currTime = this.currTime
      let endTime = this.timeEnd
      let radarsInterval = setInterval(function () {
        if (currTime.getTime() === endTime.getTime()) {
          console.log('radars over')
          clearInterval(radarsInterval)
        }
        // update old text
        if (count.count > 60) {
          d3.select('#rtext' + count.count - 60).remove()
        }
        for (let i = count.count - 1; i >= count.count - 60 && i >= 0; i--) {
          d3.select('#rtext' + i).attr('transform', function () {
            return 'translate(0,' + 15 * (count.count - i) + ')'
          })
        }
        // update old glyph
        if (count.count >= 11) {
          d3.select('#rfile' + count.count - 11).attr('opacity', 0)
          d3.select('#rport' + count.count - 11).attr('opacity', 0)
          d3.select('#rpipe' + count.count - 11).attr('opacity', 0)
          d3.select('#rall' + count.count - 11).attr('opacity', 0)
        }
        for (let i = count.count - 10; i < count.count && i >= 0; i++) {
          let opacity = (1 - (count.count - i) * 0.1)
          d3.select('#rfile' + i)
            .attr('opacity', opacity)
          d3.select('#rport' + i)
            .attr('opacity', opacity)
          d3.select('#rpipe' + i)
            .attr('opacity', opacity)
          d3.selectAll('#rall' + i)
            .attr('opacity', opacity)
        }
        let color = colorScale(Math.ceil(Math.random() * 10))
        let time = currTime.getTime()
        let file = new Map()
        let pipe = new Map()
        let port = new Map()
        let atmType = new Map()
        let sip = new Map()
        let dip = new Map()
        let ip = new Map()
        let slen = 0
        let flen = 0
        let scount = 0
        let fcount = 0
        for (let i = 0; i < timeGap; i++) {
          let currentData = timeMap.get(time)
          if (currentData) {
            currentData.value.forEach(function (d) {
              // file
              if (!file.get(d.fileaffix)) {
                file.set(d.fileaffix, {value: 1})
              } else {
                (file.get(d.fileaffix).value)++
              }
              // pipe
              if (!pipe.get(d.vpipe)) {
                pipe.set(d.vpipe, {value: 1})
              } else {
                (pipe.get(d.vpipe).value)++
              }
              // atmtype
              if (!atmType.get(d.atm1aaltype)) {
                atmType.set(d.atm1aaltype, {value: 1})
              } else {
                (atmType.get(d.atm1aaltype).value)++
              }
              // port
              // create port
              let sp = (dport.includes(parseInt(d.srcport))) ? parseInt(d.srcport) : undefined
              let dp = (dport.includes(parseInt(d.dstport))) ? parseInt(d.dstport) : undefined
              let rp
              if (sp && !dp) {
                rp = sp
              } else if (!sp && dp) {
                rp = dp
              } else if (sp && dp) {
                rp = (sp <= dp) ? sp : dp
              } else {
                rp = 'other'
              }
              if (!port.get(rp)) {
                port.set(rp, {value: 1})
              } else {
                (port.get(rp).value)++
              }
              // ip
              let srcip = d.srcip
              let dstip = d.dstip
              if (!ip.get(srcip)) {
                ip.set(srcip, {value: 1})
              } else {
                (ip.get(srcip).value)++
              }
              if (!ip.get(dstip)) {
                ip.set(dstip, {value: 1})
              } else {
                (ip.get(dstip).value)++
              }
              if (!sip.get(srcip)) {
                sip.set(srcip, {value: 1})
              } else {
                (sip.get(srcip).value)++
              }
              if (!dip.get(dstip)) {
                dip.set(dstip, {value: 1})
              } else {
                (dip.get(dstip).value)++
              }
              // cracked
              if (parseInt(d.iscracked) <= 0) {
                slen += parseInt(d.filelen)
                scount++
              } else {
                flen += parseInt(d.filelen)
                fcount++
              }
            })
          }
          currTime = new Date(currTime.getTime() + 1000)
          time = currTime.getTime()
        }
        // create file situation awareness
        let rmap = new Map()
        rmap.set('slen', fValueScale(slen / maxFile.filelen / check))
        rmap.set('flen', fValueScale(flen / maxFile.filelen / check))
        rmap.set('scount', fValueScale(scount / maxFile.count / check))
        rmap.set('fcount', fValueScale(fcount / maxFile.count / check))
        rmap.set('file', fValueScale([...file].length / maxFile.file / check))
        rmap.set('port', portValueScale([...port].length / maxFile.port / check))
        rmap.set('pipe', pipeValueScale([...pipe].length / maxFile.pipe / check))
        rmap.set('atmType', fValueScale([...atmType].length / maxFile.atm / check))
        rmap.set('aip', allValueScale([...ip].length / maxFile.ip / (check / 2)))
        rmap.set('afile', allValueScale(compThreat(rfile, rmap, 'file')))
        rmap.set('aport', allValueScale(compThreat(rport, rmap, 'port')))
        rmap.set('apipe', allValueScale(compThreat(rpipe, rmap, 'pipe')))
        let fpoints = []
        for (let key in rfile) {
          let r
          if (key !== 'valueScale' && key !== 'originAngle' && key !== 'num' && key !== 'type') {
            if (key === 'type') {
              r = rmap.get('file')
            } else {
              r = rmap.get(key)
            }
            let x = cx + r * Math.cos(rfile[key])
            let y = cy + r * Math.sin(rfile[key])
            fpoints.push([x, y])
          }
        }

        let popoints = []
        for (let key in rport) {
          let r
          if (key !== 'valueScale' && key !== 'originAngle' && key !== 'num' && key !== 'type') {
            if (key === 'type') {
              r = rmap.get('port')
            } else {
              r = rmap.get(key)
            }
            let x = cx + r * Math.cos(rport[key])
            let y = cy + r * Math.sin(rport[key])
            popoints.push([x, y])
          }
        }
        let pipoints = []
        for (let key in rpipe) {
          let r
          if (key !== 'valueScale' && key !== 'originAngle' && key !== 'num' && key !== 'type') {
            if (key === 'type') {
              r = rmap.get('pipe')
            } else {
              r = rmap.get(key)
            }
            let x = cx + r * Math.cos(rpipe[key])
            let y = cy + r * Math.sin(rpipe[key])
            pipoints.push([x, y])
          }
        }
        let allpoints = []
        for (let key in rall) {
          let r
          if (key !== 'valueScale' && key !== 'originAngle' && key !== 'num') {
            r = rmap.get(key)
            let x = cx + r * Math.cos(rall[key])
            let y = cy + r * Math.sin(rall[key])
            allpoints.push([x, y])
          }
        }
        d3.select('#rfile').select('svg')
          .append('path')
          .attr('d', linePath(fpoints))
          .attr('stroke', color)
          .attr('id', 'rfile' + count.count)
          .attr('class', 'rfile')
          // .attr('opacity', 0.5)
          .attr('fill', color)
        d3.select('#rport').select('svg')
          .append('path')
          .attr('d', linePath(popoints))
          .attr('stroke', color)
          .attr('id', 'rport' + count.count)
          .attr('class', 'rport')
          // .attr('opacity', 0.5)
          .attr('fill', color)
        d3.select('#rpipe').select('svg')
          .append('path')
          .attr('d', linePath(pipoints))
          .attr('stroke', color)
          .attr('id', 'rpipe' + count.count)
          .attr('class', 'rpipe')
          // .attr('opacity', 0.5)
          .attr('fill', color)
        d3.select('#rall').select('svg')
          .append('path')
          .attr('d', linePath(allpoints))
          .attr('stroke', color)
          .attr('id', 'rall' + count.count)
          .attr('class', 'rall')
          // .attr('opacity', 0.5)
          .attr('fill', color)
        let con = []
        if (timeGap === 1) {
          con.push(currTime.getSeconds())
        } else if (timeGap === 60) {
          con.push(currTime.getMinutes())
        } else if (timeGap === 3600) {
          con.push(currTime.getDate())
        } else {
          con.push('NULL')
        }
        con.push(Math.round(rmap.get('aip') * 100) / 100)
        con.push(Math.round(rmap.get('afile') * 100) / 100)
        con.push(Math.round(rmap.get('aport') * 100) / 100)
        con.push(Math.round(rmap.get('apipe') * 100) / 100)
        let textg = d3.select('#rtextcontent').select('svg').append('g')
                          .attr('id', 'rtext' + count.count)
        textg.selectAll('text')
            .data(con)
            .enter()
            .append('text')
            .attr('x', function (d, i) { return 75 * i + 40 })
            .attr('y', 15)
            .attr('stroke', color)
            .attr('font-family', 'arial')
            .attr('font-size', '10px')
            .text(function (d) { return d })
        count.count++
      }, this.activateStep)
      this.radarsInterval = radarsInterval
    },
    clearInterval: function () {
      clearInterval(this.radarsInterval)
    }
  },
  components: {},
  mounted: function () {
    this.drawRadars()
  }
}
</script>

<style scoped>
#rport, #rpipe, #rfile, #rall {
  border: 1px steelblue solid;
  /*border-radius: 10px;*/
  padding: 4.5px;
  height:  200px;
  width: 200px;
}
#rtext {
  border: 1px steelblue solid;
}
table {
  width: 383px;
  font-size: 3px;
  border-collapse: collapse;
  margin-left: 13px;
}
tr {
  height: 20px;
}
th {
  color: white;
}
td, th {
  height: 18px;
  width: 100px;
  overflow: hidden;
}
</style>
