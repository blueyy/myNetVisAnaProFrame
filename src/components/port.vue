<template>
<div>
  <div id='portMul'></div>
</div>
</template>

<script>
let d3 = require('d3')
export default {
  props: ['data', 'activateStep', 'originPort', 'minFile', 'maxFile', 'timeEnd', 'currTime'],
  data: function () {
    return {
      portDomain: [],
      portArcScale: {},
      portMulArc: {},
      portLenScale: {},
      angleUnit: 0,
      portMulCount: {count: 0},
      peseudoData: new Map(),
      portMulS: new Map(),
      portMulInterval: {}
    }
  },
  methods: {
    drawPortTimeMul: function () {
      let port = this.originPort
      let portInnerRadius = 180
      let portOuterRadius = 190
      let portArcMargin = 0.01
      this.stepRadius = 13
      this.radiusMargin = 0
      this.outerRadius = 179
      this.innerRadius = this.outerRadius - (this.stepRadius - this.radiusMargin)
      let portArcScale = new Map()
      let portDomain = (function () {
        let arr = []
        for (let key of port.keys()) {
          arr.push(key)
        }
        return arr
      })()
      let portDomainLen = portDomain.length
      let svg = d3.select('#portMul').append('svg')
                  .attr('width', 400)
                  .attr('height', 400)
      // arc
      let portArcPath = d3.svg.arc()
                          .innerRadius(portInnerRadius)
                          .outerRadius(portOuterRadius)
      let portArc = svg.append('g')
      portArc.selectAll('path')
            .data(portDomain)
            .enter()
            .append('path')
            .attr('d', function (d, i) {
              let startAngle = (Math.PI * 2 / portDomainLen) * i
              let endAngle = (Math.PI * 2 / portDomainLen) * (i + 1) - portArcMargin
              portArcScale.set(d, {startAngle: startAngle, endAngle: endAngle, color: port.get(d).color})
              return portArcPath({startAngle: startAngle, endAngle: endAngle})
            })
            .attr('fill', function (d, i) {
              return port.get(d).color
            })
            .attr('transform', 'translate(200, 200)')
      // grid
      let portMulGrid = svg.append('g')
      for (let i = 0; i < 7; i++) {
        portMulGrid.append('circle')
                  .attr('cx', 200)
                  .attr('cy', 200)
                  .attr('r', function (d) {
                    return 179 - 13 * i
                  })
                  .attr('stroke', 'white')
                  .attr('stroke-width', '0.5px')
                  .attr('stroke-dasharray', '1,1')
                  .attr('fill', 'none')
      }
      portMulGrid.append('circle')
                .attr('cx', 200)
                .attr('cy', 200)
                .attr('r', 15)
                .attr('stroke', 'white')
                .attr('stroke-width', '1px')
                .attr('stroke-dasharray', '1,1')
                .attr('fill', 'none')
      let len = portDomainLen
      let angleUnit = ((Math.PI * 2 - portArcMargin * (portDomain.length - 1)) / portDomain.length) / 10
      for (let i = 0; i < len; i++) {
        let start = portArcScale.get(portDomain[i]).startAngle
        for (let j = 0; j < 11; j++) {
          let angle = start + j * angleUnit - Math.PI / 2
          portMulGrid.append('line')
                    .attr('x1', function (d) {
                      return 200 + 101 * Math.cos(angle)
                    })
                    .attr('y1', function (d) {
                      return 200 + 101 * Math.sin(angle)
                    })
                    .attr('x2', function (d) {
                      return 200 + 179 * Math.cos(angle)
                    })
                    .attr('y2', function (d) {
                      return 200 + 179 * Math.sin(angle)
                    })
                    .attr('stroke', function (d) {
                      if (j === 0 || j === 10) {
                        return '#ffcccc'
                      } else {
                        return 'white'
                      }
                    })
                    .attr('stroke-width', function (d) {
                      if (j === 0 || j === 10) {
                        return '1px'
                      } else {
                        return '0.5px'
                      }
                    })
                    .attr('stroke-dasharray', '1,1')
        }
      }
      this.portArcScale = portArcScale
      this.portDomain = portDomain
      this.angleUnit = (Math.PI * 2 / portDomainLen) / 10
      this.portMulArc = d3.svg.arc()
                          .innerRadius(this.innerRadius)
                          .outerRadius(this.outerRadius)
      this.portLenScale = d3.scale.linear()
                            .domain([0, 700000])
                            .range([5, 35])
    },
    realTimeRenderPortMul: function (timeGap) {
      // data structure
      let check = 1
      if (timeGap === 1) {
        check = 1
      } else if (timeGap === 60) {
        check = 10
      } else if (timeGap === 3600) {
        check = 300
      }
      let minFile = this.minFile
      let maxFile = this.maxFile
      let data = this.data
      let originPort = this.originPort
      let peseudoData = this.peseudoData
      let timeMap = data.timeMap
      let portArcScale = this.portArcScale
      let portMulS = this.portMulS
      // render detail
      let currTime = this.currTime
      let endTime = this.timeEnd
      let count = this.portMulCount
      let svg = d3.select('#portMul').select('svg')
      let stepRadius = this.stepRadius
      let radiusMargin = this.radiusMargin
      let outerRadius = this.outerRadius
      let angleUnit = this.angleUnit
      let portMulArc = this.portMulArc
      let portLenScale = this.portLenScale
      // interval
      var portMulInterval = setInterval(function () {
        if (currTime.getTime() === endTime.getTime()) { // break the interval
          console.log('port mul over')
          clearInterval(portMulInterval)
          return
        }
        let time = currTime.getTime()
        let portMap = new Map()
        for (let i = 0; i < timeGap; i++) {
          if (timeMap.get(time)) {
            let value = timeMap.get(time)
            value.value.forEach(function (port) { // process time data to a peseuso time map
              port.port = (function () {
                let sport = originPort.get(port.srcport) || originPort.get('other')
                let dport = originPort.get(port.dstport) || originPort.get('other')
                if (sport.flag === '1' && dport.flag !== '1') {
                  return sport.port
                } else if (dport.flag === '1' && sport.flag !== '1') {
                  return dport.port
                } else if (dport.flag !== '1' && sport.flag !== '1') {
                  return 'other'
                } else {
                  return (parseInt(sport.port) <= parseInt(dport.port)) ? sport.port : dport.port
                }
              })()
              if (!portMap.get(port.port)) {
                let mapValue = {}
                mapValue.port = port.port
                mapValue.filelen = parseInt(port.filelen)
                mapValue.count = 1
                mapValue.iscracked = {cracked: 0, sum: 0}
                mapValue.iscracked.cracked = (port.iscracked > 0) ? port.filelen : 0
                mapValue.iscracked.sum = parseInt(port.filelen)
                mapValue.color = originPort.get(port.port).color
                portMap.set(port.port, mapValue)
              } else {
                let mapValue = portMap.get(port.port)
                mapValue.filelen += parseInt(port.filelen)
                mapValue.count++
                mapValue.iscracked.cracked = (port.iscracked > 0) ? (mapValue.cracked + port.filelen) : mapValue.cracked
                mapValue.iscracked.sum += parseInt(port.filelen)
              }
            })
          }
          currTime = new Date(currTime.getTime() + 1000)
          time = currTime.getTime()
        }
        let portArray = [...portMap]
        portArray.sort(function (a, b) {
          return a[0] - b[0]
        })
        portMap = new Map(portArray)
        if (count.count > 59) {
          d3.select('.pmg' + (count.count - 60)).remove()
          d3.select('.pms' + (count.count - 60)).remove()
        }
        for (let i = count.count - 1; i > (count.count - 60) && i >= 0; i--) {
          d3.select('.pmg' + i).selectAll('path')
            .attr('d', function (d) {
              let id = d3.select(this).attr('id').split('.')[1]
              let outer = outerRadius - Math.floor((count.count - i) / 10) * stepRadius
              let inner = outer - (stepRadius - radiusMargin)
              let start = portArcScale.get(id).startAngle + (count.count - i) % 10 * angleUnit
              let end = start + angleUnit - 0.01
              let arc = d3.svg.arc()
                          .innerRadius(inner)
                          .outerRadius(outer)
              return arc({startAngle: start, endAngle: end})
            })
          let radiusMap = portMulS.get(i)
          d3.select('.pms' + i).selectAll('path')
            .attr('d', function () {
              let port = d3.select(this).attr('id').split('.')[1]
              let radius = radiusMap.get(port)
              let start = (count.count - i) * (Math.PI * 2 / 60)
              let end = (count.count - i + 1) * (Math.PI * 2 / 60) - 0.01
              let arc = d3.svg.arc()
                          .innerRadius(radius.innerRadius)
                          .outerRadius(radius.outerRadius)
              return arc({startAngle: start, endAngle: end})
            })
        }
        let g = svg.append('g')
                  .attr('class', function () {
                    return 'pmg' + count.count
                  })
        let s = svg.append('g')
                  .attr('class', function () {
                    return 'pms' + count.count
                  })
        let accuInnerR = 15
        let sMap = new Map()
        for (let port of portMap.values()) {
          // gantt
          let startAngle = portArcScale.get(port.port).startAngle
          let endAngle = startAngle + angleUnit - 0.01
          let filelen = port.filelen / check
          let arcFill = (function () {
            if (filelen <= minFile.filelen) {
              return 'green'
            } else if (filelen >= maxFile.filelen) {
              return 'red'
            } else {
              let per = (filelen - minFile.filelen) / (maxFile.filelen - minFile.filelen)
              let r = Math.floor(255 * per)
              let g = Math.floor(255 * (1 - per))
              return 'rgb(' + r + ',' + g + ',0)'
            }
          })()
          g.append('path')
            .attr('d', portMulArc({startAngle: startAngle, endAngle: endAngle}))
            .attr('fill', arcFill)
            .attr('transform', 'translate(200, 200)')
            .attr('id', function (d) {
              return 'pmg.' + port.port
            })
          // arc stack
          let height = portLenScale(port.filelen / check)
          let inner = accuInnerR
          accuInnerR += height
          let outer = accuInnerR
          sMap.set(port.port, {innerRadius: inner, outerRadius: outer})
          s.append('path')
            .attr('d', function () {
              let arc = d3.svg.arc()
                          .innerRadius(inner)
                          .outerRadius(outer)
              return arc({startAngle: 0, endAngle: Math.PI * 2 / 60 - 0.01})
            })
            .attr('id', function (d) {
              return 'pms.' + port.port
            })
            .attr('fill', port.color)
            .attr('transform', 'translate(200, 200)')
        }
        portMulS.set(count.count, sMap)
        peseudoData.set(time, portMap)
        count.count++
      }, this.activateStep)
      this.portMulInterval = portMulInterval
    },
    clearInterval: function () {
      clearInterval(this.portMulInterval)
    }
  },
  mounted: function () {
    this.drawPortTimeMul()
  }
}
</script>

<style scoped>
#portMul {
  border: 1px solid steelblue;
  /*border-radius: 10px;*/
  width: 410px;
  height: 410px;
  padding: 5px;
  margin-left: 5px;
}
</style>