<template>
  <div style="float: left">
    <div id='pipeConnect'></div>
    <div id='pipeArea'></div>
  </div>
</template>

<script>
let d3 = require('d3')
export default {
  props: ['data', 'activateStep', 'originPipe', 'originIPRelate', 'minFile', 'maxFile', 'timeEnd', 'currTime'],
  data: function () {
    return {
      pipeDomain: [],
      pipeScale: {},
      srcDomain: [],
      srcScale: {},
      dstDomain: [],
      dstScale: {},
      timeDomain: [],
      timeScale: {},
      wellLenDomain: [],
      wellLenScale: {},
      badLenDomain: [],
      badLenScale: {},
      peseudoConnectData: new Map(),
      peseudoAreaData: new Map(),
      pipeSumLen: new Map(),
      pipeConnectCount: {count: 0},
      pipeAreaCount: {count: 0},
      pipeConnectInterval: {},
      pipeAreaInterval: {},
      areaMap: new Map(),
      wellAreaPath: d3.svg.area().x(function (d) { return d.x })
                      .y0(function (d) { return d.y0 })
                      .y1(function (d) { return d.y1 })
                      .interpolate('basis'),
      badAreaPath: d3.svg.area().x(function (d) { return d.x })
                    .y0(function (d) { return d.y0 })
                    .y1(function (d) { return d.y1 })
                    .interpolate('basis')
    }
  },
  methods: {
    drawPipeConnect: function () {
      let src = this.originIPRelate.peseudoNodesS
      let dst = this.originIPRelate.peseudoNodesD
      let pipe = this.originPipe
      let srcDomain = (function () {
        let arr = []
        for (let key of src.keys()) {
          arr.push(key)
        }
        return arr
      })()
      let dstDomain = (function () {
        let arr = []
        for (let key of dst.keys()) {
          arr.push(key)
        }
        return arr
      })()
      let pipeDomain = (function () {
        let arr = []
        for (let key of pipe.keys()) {
          arr.push(key)
        }
        return arr
      })()
      let srcScale = d3.scale.ordinal()
                      .domain(srcDomain)
                      .rangePoints([Math.PI / 2, Math.PI * 3 / 2])
      let dstScale = d3.scale.ordinal()
                      .domain(dstDomain)
                      .rangePoints([Math.PI / -2, Math.PI / 2])
      let pipeScale = d3.scale.ordinal()
                      .domain(pipeDomain)
                      .rangePoints([10, 590])
      let svg = d3.select('#pipeConnect').append('svg')
                  .attr('width', 820)
                  .attr('height', 615)
      let srcg = svg.append('g')
                    .attr('class', 'src')
      let dstg = svg.append('g')
                    .attr('class', 'dst')
      let pipeg = svg.append('g')
                    .attr('class', 'pipe')
      srcg.selectAll('circle')
          .data(srcDomain)
          .enter()
          .append('circle')
          .attr('r', '1px')
          .attr('cx', function (d) {
            return 305 + 300 * Math.cos(srcScale(d))
          })
          .attr('cy', function (d) {
            return 305 + 300 * Math.sin(srcScale(d))
          })
          .attr('fill', 'white')
          .attr('stroke', '1px')
      srcg.selectAll('text')
          .data(srcDomain)
          .enter()
          .append('text')
          .attr('x', function (d) {
            return 305 + 290 * Math.cos(srcScale(d))
          })
          .attr('y', function (d) {
            return 305 + 290 * Math.sin(srcScale(d))
          })
          .text(function (d) {
            return d
          })
          .attr('opacity', 0)
          .attr('id', function (d) {
            return 'sc' + d
          })
      dstg.selectAll('circle')
          .data(dstDomain)
          .enter()
          .append('circle')
          .attr('r', '1px')
          .attr('cx', function (d) {
            return 510 + 300 * Math.cos(dstScale(d))
          })
          .attr('cy', function (d) {
            return 305 + 300 * Math.sin(dstScale(d))
          })
          .attr('fill', 'white')
          .attr('stroke', '1px')
      dstg.selectAll('text')
          .data(dstDomain)
          .enter()
          .append('text')
          .attr('x', function (d) {
            return 495 + 290 * Math.cos(dstScale(d))
          })
          .attr('y', function (d) {
            return 305 + 290 * Math.sin(dstScale(d))
          })
          .text(function (d) {
            return d
          })
          .attr('opacity', 0)
          .attr('id', function (d) {
            return 'dc' + d
          })
      pipeg.selectAll('rect')
          .data(pipeDomain)
          .enter()
          .append('rect')
          .attr('y', function (d) {
            return pipeScale(d)
          })
          .attr('x', '340')
          .attr('rx', '1px')
          .attr('ry', '1px')
          .attr('height', '5')
          .attr('width', '150')
          .attr('fill', 'none')
          .attr('stroke', function (d) {
            return pipe.get(d).color
          })
          .attr('stroke-width', '1px')
      let vpi1 = svg.append('g')
                    .attr('class', 'vpi1')
      vpi1.selectAll('text')
          .data(pipeDomain)
          .enter()
          .append('text')
          .attr('y', function (d) {
            return pipeScale(d) + 7
          })
          .attr('x', '305')
          .text(function (d) {
            if (d === 'no-type') {
              return 'unk'
            } else {
              return d.split('-')[0]
            }
          })
          .attr('font-size', '2px')
          .attr('fill', function (d) {
            return pipe.get(d).color
          })
      let vci1 = svg.append('g')
                    .attr('class', 'vci1')
      vci1.selectAll('text')
          .data(pipeDomain)
          .enter()
          .append('text')
          .attr('y', function (d) {
            return pipeScale(d) + 6
          })
          .attr('x', '495')
          .text(function (d) {
            if (d === 'no-type') {
              return 'unk'
            } else {
              return d.split('-')[1]
            }
          })
          .attr('font-size', '2px')
          .attr('fill', function (d) {
            return pipe.get(d).color
          })
      this.pipeDomain = pipeDomain
      this.pipeScale = pipeScale
      this.srcDomain = srcDomain
      this.srcScale = srcScale
      this.dstDomain = dstDomain
      this.dstScale = dstScale
    },
    drawPipeArea: function () {
      let timeDomain = (function () {
        let arr = []
        for (let i = 59; i >= 0; i--) {
          arr.push(i)
        }
        arr.push('')
        return arr
      })()
      let wellLenDomain = [0, this.maxFile.filelen]
      let badLenDomain = [0, this.maxFile.filelen]
      let timeScale = d3.scale.ordinal()
                        .domain(timeDomain)
                        .rangePoints([0, 730])
      let wellLenScale = d3.scale.linear()
                          .domain(wellLenDomain)
                          .range([140, 15])
      let badLenScale = d3.scale.linear()
                          .domain(badLenDomain)
                          .range([142, 190])
      let timeAxis = d3.svg.axis()
                      .scale(timeScale)
                      .orient('bottom')
      let wellLenAxis = d3.svg.axis()
                          .scale(wellLenScale)
                          .orient('left')
      let badLenAxis = d3.svg.axis()
                        .scale(badLenScale)
                        .orient('left')
      let svg = d3.select('#pipeArea').append('svg')
                  .attr('width', 820)
                  .attr('height', 205)
      let gtimeAxis = svg.append('g')
                        .attr('class', 'time')
                        .attr('transform', 'translate(70, 140)')
      let gwellAxis = svg.append('g')
                        .attr('class', 'well')
                        .attr('transform', 'translate(70, 2)')
      let gbadAxis = svg.append('g')
                        .attr('class', 'bad')
                        .attr('transform', 'translate(70, 0)')
      gtimeAxis.call(timeAxis)
      gwellAxis.call(wellLenAxis)
      gbadAxis.call(badLenAxis)
      d3.selectAll('.tick').select('line')
        .attr('stroke', 'white')
        .attr('stroke-width', '0.3px')
      d3.selectAll('.tick').select('text')
        .attr('font-family', 'arial')
        .attr('font-size', '1px')
        .attr('fill', 'white')
      d3.selectAll('.well').selectAll('path')
        .attr('fill', 'none')
        .attr('stroke', 'white')
        .attr('stroke-width', '0.5px')
      d3.selectAll('.well').selectAll('text')
        .attr('transform', 'translate(0,7)')
      d3.selectAll('.bad').selectAll('path')
        .attr('fill', 'none')
        .attr('stroke', 'white')
        .attr('stroke-width', '0.5px')
      d3.selectAll('.bad').selectAll('text')
        .attr('transform', 'translate(0,7)')
      d3.selectAll('.time').selectAll('path')
        .attr('fill', 'none')
        .attr('stroke', 'white')
        .attr('stroke-width', '0.5px')
        .attr('transform', 'translate(0, 2)')
      d3.selectAll('.time').selectAll('text').remove()
      let x1 = 70
      let x2 = 800
      for (let i = 0; i < 71; i++) {
        let y1 = wellLenScale(i * 10000) + 2
        let y2 = badLenScale(i * 10000)
        svg.append('line')
          .attr('x1', x1)
          .attr('y1', y1)
          .attr('x2', x2)
          .attr('y2', y1)
          .attr('stroke', 'white')
          .attr('stroke-width', function () {
            if (i % 10 === 0) {
              return '0.2px'
            } else {
              return '0.1px'
            }
          })
          .attr('fill', 'none')
        svg.append('line')
          .attr('x1', x1)
          .attr('y1', y2)
          .attr('x2', x2)
          .attr('y2', y2)
          .attr('stroke', 'white')
          .attr('stroke-width', '0.1px')
          .attr('fill', 'none')
      }
      let y1 = 17
      let y2 = 200
      for (let i = 0; i < 60; i++) {
        let x1 = timeScale(i) + 70 + timeScale(0) - timeScale(1)
        svg.append('line')
          .attr('x1', x1)
          .attr('y1', y1)
          .attr('x2', x1)
          .attr('y2', y2)
          .attr('stroke', 'white')
          .attr('stroke-width', '0.1px')
          .attr('fill', 'none')
      }
      this.timeDomain = timeDomain
      this.timeScale = timeScale
      this.wellLenDomain = wellLenDomain
      this.wellLenScale = wellLenScale
      this.badLenDomain = badLenDomain
      this.badLenScale = badLenScale
    },
    realTimeRenderPipeConnect: function (timeGap) {
      let check = 1
      if (timeGap === 1) {
        check = 1
      } else if (timeGap === 60) {
        check = 60
      } else if (timeGap === 3600) {
        check = 100
      }
      // data structure
      let pipe = this.originPipe
      let pipeScale = this.pipeScale
      let srcScale = this.srcScale
      let dstScale = this.dstScale
      let originNodes = this.originIPRelate.originNodes
      let data = this.data
      let peseudoConnectData = this.peseudoConnectData
      let timeMap = data.timeMap
      let pipeSumLen = this.pipeSumLen
      let minFile = this.minFile
      let maxFile = this.maxFile
      // render detail
      let svg = d3.select('#pipeConnect').select('svg')
      let currTime = this.currTime
      let endTime = this.timeEnd
      let count = this.pipeConnectCount
      var pipeConnectInterval = setInterval(function () {
        if (currTime.getTime() === endTime.getTime()) {
          d3.selectAll('.pcpath').attr('opacity', 0.5)
          console.log('pipe connect over')
          clearInterval(pipeConnectInterval)
        }
        let time = currTime.getTime()
        let pipeMap = new Map()
        for (let i = 0; i < timeGap; i++) {
          if (timeMap.get(time)) {
            let value = timeMap.get(time)
            value.value.forEach(function (d) {
              let r = pipeMap.get(d.vpipe)
              if (!r) {
                let mapValue = {}
                mapValue.pipe = d.vpipe
                mapValue.filelen = parseInt(d.filelen)
                mapValue.count = 1
                mapValue.iscracked = {cracked: 0, sum: 0}
                mapValue.iscracked.cracked = (d.iscracked > 0) ? parseInt(d.filelen) : 0
                mapValue.iscracked.sum = parseInt(d.filelen)
                mapValue.color = pipe.get(d.vpipe).color
                mapValue.value = []
                mapValue.value.push(d)
                mapValue.links = []
                r = mapValue
                pipeMap.set(d.vpipe, mapValue)
              } else {
                r.filelen += parseInt(d.filelen)
                r.count++
                r.iscracked.sum += parseInt(d.filelen)
                r.iscracked.cracked += (d.iscracked > 0) ? parseInt(d.filelen) : 0
                r.value.push(d)
              }
              let sname = originNodes.get(d.srcip).name
              let tname = originNodes.get(d.dstip).name
              let s1 = {x: 0, y: 0}
              let s2 = {x: 0, y: 0}
              let t1 = {x: 0, y: 0, name: sname}
              let t2 = {x: 0, y: 0, name: tname}
              s1.y = pipeScale([d.vpipe])
              s1.x = 340
              s2.y = s1.y
              s2.x = s1.x + 150
              t1.y = 305 + 300 * Math.sin(srcScale(sname))
              t1.x = 305 + 300 * Math.cos(srcScale(sname))
              t2.y = 305 + 300 * Math.sin(dstScale(tname))
              t2.x = 510 + 300 * Math.cos(dstScale(tname))
              r.links.push({source: s1, target: t1})
              r.links.push({source: s2, target: t2})
            })
          }
          currTime = new Date(currTime.getTime() + 1000)
          time = currTime.getTime()
        }
        if (count.count >= 11) {
          d3.select('#pC' + (count.count - 11))
            .attr('opacity', 0)
        }
        for (let i = count.count - 1; i < count.count - 11 && i >= 0; i++) {
          d3.select('#pC' + i)
            .attr('opacity', (1 - (count.count - i) * 0.1))
        }
        let g = svg.append('g')
                  .attr('id', function () {
                    return 'pC' + count.count
                  })
                  .attr('class', function () {
                    return 'pcpath'
                  })
        let d = d3.svg.diagonal()
        for (let pc of pipeMap.values()) {
          let links = pc.links
          let color = pc.color
          g.selectAll('path')
            .data(links)
            .enter()
            .append('path')
            .attr('d', d)
            .attr('fill', 'none')
            .attr('stroke', color)
          let h = (function () {
            if (pc.filelen / check <= minFile.filelen) {
              return 10
            } else if (pc.filelen / check >= maxFile.filelen) {
              return 145
            } else {
              return 150 * pc.filelen / check / (maxFile.filelen - minFile.filelen)
            }
          })()
          g.append('rect')
            .attr('y', function (d) {
              return pipeScale(pc.pipe) + 0.5
            })
            .attr('x', '340')
            .attr('width', h)
            .attr('height', 4)
            .attr('fill', function () {
              return pc.color
            })
          if (pipeSumLen.get(pc.pipe) === undefined) {
            let x = 340
            let y = pipeScale(pc.pipe) + 5
            let h = 5
            let w = 0
            if (pc.filelen < 5000) {
              w = 1
            } else {
              w = 2
            }
            pipeSumLen.set(pc.pipe, {filelen: pc.filelen, w: w})
            svg.append('rect')
                .attr('x', x)
                .attr('y', y)
                .attr('width', w)
                .attr('height', h)
                .attr('fill', pc.color)
                .attr('id', function () {
                  return 'pcsum' + pc.pipe
                })
          } else {
            let w = 0
            if (pc.filelen < (5000 * check)) {
              w += 0.1
            } else {
              w += 0.2
            }
            pipeSumLen.get(pc.pipe).w += w
            d3.select('#pcsum' + pc.pipe)
              .attr('width', pipeSumLen.get(pc.pipe).w)
          }
        }
        peseudoConnectData.set(time, pipeMap)
        count.count++
      }, this.activateStep)
      this.pipeConnectInterval = pipeConnectInterval
    },
    realTimeRenderPipeArea: function (timeGap) {
      let check = 1
      if (timeGap === 1) {
        check = 1
      } else if (timeGap === 60) {
        check = 6.5
      } else if (timeGap === 3600) {
        check = 125
      }
      // data structure
      let data = this.data
      let peseudoAreaData = this.peseudoAreaData
      let originPipe = this.originPipe
      let timeMap = data.timeMap
      let areaMap = this.areaMap
      let pipeDomain = this.pipeDomain
      let timeScale = this.timeScale
      let wellLenScale = this.wellLenScale
      let badLenScale = this.badLenScale
      let count = this.pipeAreaCount
      // render detail
      let svg = d3.select('#pipeArea').select('svg')
      if (d3.select('#unit')) {
        d3.select('#unit').text('/' + check)
      } else {
        svg.selectAll('text')
          .data([('/' + check)])
          .enter()
          .append('text')
          .attr('x', 250)
          .attr('y', 12)
          .attr('text', function (d) { return d })
          .attr('fill', 'gray')
          .attr('id', 'unit')
      }
      let wellAreaPath = this.wellAreaPath
      let badAreaPath = this.badAreaPath
      // interval
      let currTime = this.currTime
      let endTime = this.timeEnd
      let x = timeScale(0) + timeScale(0) - timeScale(1) + 70
      let movex = timeScale(1) - timeScale(0)
      let texty = 145
      let textx = 800
      var pipeAreaInterval = setInterval(function () {
        if (currTime.getTime() === endTime.getTime()) { // break the interval
          console.log('pipe area over')
          clearInterval(pipeAreaInterval)
          return
        }
        // current time pipemap
        let time = currTime.getTime()
        let pipeMap = new Map()
        for (let i = 0; i < timeGap; i++) {
          if (timeMap.get(time)) {
            let value = timeMap.get(time)
            value.value.forEach(function (d) {
              let r = pipeMap.get(d.vpipe)
              if (!r) {
                r = {}
                r.pipe = d.vpipe
                r.count = 1
                r.filelen = parseInt(d.filelen)
                r.iscracked = {cracked: 0, sum: 0}
                r.iscracked.cracked = (parseInt(d.iscracked) > 0) ? parseInt(d.filelen) : 0
                r.iscracked.sum = parseInt(d.filelen)
                r.color = originPipe.get(d.vpipe).color
                r.value = []
                r.value.push(d)
                r.well = {y0: 140, y1: 140, x: x}
                r.bad = {y0: 140, y1: 140, x: x}
                pipeMap.set(d.vpipe, r)
              } else {
                r.filelen += parseInt(d.filelen)
                r.count++
                r.iscracked.sum += parseInt(d.filelen)
                r.iscracked.cracked += (parseInt(d.iscracked) > 0) ? parseInt(d.filelen) : 0
                r.value.push(d)
                r.well = {y0: 140, y1: 140, x: x}
                r.bad = {y0: 140, y1: 140, x: x}
              }
            })
          }
          currTime = new Date(currTime.getTime() + 1000)
          time = currTime.getTime()
        }
        // create sorting pipe area
        let pipeArray = []
        let len = pipeDomain.length
        let sumlen = 0
        for (let i = 0; i < len; i++) {
          let key = pipeDomain[i]
          if (!pipeMap.get(key)) {
            let pipe = {}
            pipe.pipe = key
            pipe.count = 1
            pipe.filelen = 0
            pipe.iscracked = {cracked: 0, sum: 0}
            pipe.color = originPipe.get(key).color
            pipe.value = []
            pipe.well = {y0: 140, y1: 140, x: x}
            pipe.bad = {y0: 140, y1: 140, x: x}
            pipeArray.push(pipe)
          } else {
            pipeArray.push(pipeMap.get(key))
            sumlen += pipeMap.get(key).filelen
          }
        }
        pipeArray.sort(function (a, b) {
          return a.key < b.key
        })
        // create y1
        if (len > 0) {
          let currentHW = 140
          let currentHD = 140
          let zHW = 140.05
          let zHD = 141.9
          for (let i = 0; i < len; i++) {
            let pipe = pipeArray[i]
            pipe.well.y0 = currentHW
            pipe.well.y1 = currentHW - zHW + wellLenScale((pipe.iscracked.sum - pipe.iscracked.cracked) / check)
            pipe.bad.y0 = currentHD
            pipe.bad.y1 = currentHD - zHD + badLenScale(pipe.iscracked.cracked / check)
            currentHW = pipe.well.y1
            currentHD = pipe.bad.y1
          }
        }
        // delete over range path node and transform path reserved
        for (let path of areaMap.values()) {
          if (count.count > 61) {
            path.area.delete(count.count - 61)
          }
          path.wellPath.attr('d', function (d) {
            let result = []
            for (let point of path.area.values()) {
              point.well.x += movex
              result.push({y0: point.well.y0, y1: point.well.y1, x: point.well.x})
            }
            return wellAreaPath(result)
          })
          path.badPath.attr('d', function (d) {
            let result = []
            for (let point of path.area.values()) {
              point.bad.x += movex
              result.push({y0: point.bad.y0, y1: point.bad.y1, x: point.bad.x})
            }
            return badAreaPath(result)
          })
        }
        // delet over range date text and transform
        if (count.count >= 61) {
          d3.select('.pA' + (count.count - 61)).remove()
        }
        for (let i = count.count - 1; i > (count.count - 62) && i >= 0; i--) {
          d3.select('.pA' + i)
            .attr('transform', function () {
              return 'translate(' + movex * (count.count - i) + ', 0)'
            })
        }
        let g = svg.append('g')
                  .attr('class', function () {
                    return 'pA' + count.count
                  })
        for (let i = 0; i < len; i++) {
          let pipe = pipeArray[i]
          let well0 = pipe.well.y0
          let well1 = pipe.well.y1
          let bad0 = pipe.bad.y0
          let bad1 = pipe.bad.y1
          let wellx = pipe.well.x
          let badx = pipe.bad.x
          if (!areaMap.get(pipe.pipe)) {
            let area = {}
            area.pipe = pipe.pipe
            area.area = new Map()
            area.area.set(count.count, {well: {y0: well0, y1: well1, x: wellx}, bad: {y0: bad0, y1: bad1, x: badx}})
            area.area.delete(0)
            area.wellPath = svg.append('path')
                              .attr('class', 'wellpath')
                              .attr('d', wellAreaPath([{y0: well0, y1: well1, x: wellx}]))
                              .attr('stroke', 'gray')
                              .attr('stroke-width', '0.1px')
                              .attr('fill', function (d) {
                                return pipe.color
                              })
                              .attr('opacity', '0.3')
            area.badPath = svg.append('path')
                              .attr('class', 'badpath')
                              .attr('d', badAreaPath([{y0: bad0, y1: bad1, x: badx}]))
                              .attr('stroke', 'gray')
                              .attr('stroke-width', '0.3px')
                              .attr('fill', function (d) {
                                return pipe.color
                              })
                              .attr('opacity', '0.3')
            areaMap.set(pipe.pipe, area)
          } else {
            let area = areaMap.get(pipe.pipe)
            area.area.set(count.count, {well: {y0: well0, y1: well1, x: wellx}, bad: {y0: bad0, y1: bad1, x: badx}})
            area.area.delete(0)
            area.wellPath.attr('d', function (d) {
              let result = []
              for (let point of area.area.values()) {
                result.push({y0: point.well.y0, y1: point.well.y1, x: point.well.x})
              }
              return wellAreaPath(result)
            })
            area.badPath.attr('d', function (d) {
              let result = []
              for (let point of area.area.values()) {
                result.push({y0: point.bad.y0, y1: point.bad.y1, x: point.bad.x})
              }
              return badAreaPath(result)
            })
          }
        }
        if (sumlen > 0) {
          g.append('text')
          .attr('x', textx)
          .attr('y', texty)
          .text(function () {
            let h = currTime.getHours()
            let min = currTime.getMinutes()
            let sec = currTime.getSeconds()
            return h + ':' + min + ':' + sec
          })
          .attr('font-size', '1px')
          .attr('transform', function () {
            return 'rotate(45' + ',' + textx + ' ' + texty + ')'
          })
          .attr('stroke', 'none')
          .attr('fill', 'white')
        }
        peseudoAreaData.set(time, pipeMap)
        count.count++
      }, this.activateStep)
      this.pipeAreaInterval = pipeAreaInterval
    },
    clearInterval: function () {
      clearInterval(this.pipeConnectInterval)
      clearInterval(this.pipeAreaInterval)
    }
  },
  mounted: function () {
    this.drawPipeConnect()
    this.drawPipeArea()
  }
}
</script>

<style scoped>
#pipeConnect {
  border: 1px steelblue solid;
  /*border-radius: 10px;*/
  padding: 5px;
  height:  615px;
  width: 820px;
}
 #pipeArea {
  border: 1px steelblue solid;
  /*border-radius: 10px;*/
  padding: 5px;
  height:  205px;
  width: 820px;
 }
</style>