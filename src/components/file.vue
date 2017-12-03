<template>
<div style="float: left;">
  <div id='fileMul'></div>
</div>
</template>

<script>
let d3 = require('d3')
export default {
  props: ['data', 'activateStep', 'originFile', 'minFile', 'maxFile', 'timeEnd', 'currTime'],
  data: function () {
    return {
      fileArcScale: {},
      stackScale: {},
      fileDomain: [],
      centerx: 200,
      centery: 200,
      stackRadius: 154,
      rotateAngle: 0,
      fileMulCount: {count: 0},
      peseudoData: new Map(),
      fileSumArcMap: new Map(),
      filelenMap: new Map()
    }
  },
  methods: {
    drawFileTimeMul: function () {
      let file = this.originFile
      let fileInnerRadius = 140
      let fileOuterRadius = 150
      let fileArcMargin = 0.01
      let fileArcScale = new Map()
      let fileDomain = (function () {
        let arr = []
        for (let key of file.keys()) {
          arr.push(key)
        }
        return arr
      })()
      let svg = d3.select('#fileMul').append('svg')
                  .attr('width', 400)
                  .attr('height', 400)
      // arc
      let fileArcPath = d3.svg.arc()
                          .innerRadius(fileInnerRadius)
                          .outerRadius(fileOuterRadius)
      let fileArc = svg.append('g')
      fileArc.selectAll('path')
            .data(fileDomain)
            .enter()
            .append('path')
            .attr('d', function (d, i) {
              let startAngle = (Math.PI * 2 / fileDomain.length) * i
              let endAngle = (Math.PI * 2 / fileDomain.length) * (i + 1) - fileArcMargin
              fileArcScale.set(d, {startAngle: startAngle, endAngle: endAngle, color: file.get(d).color})
              return fileArcPath({startAngle: startAngle, endAngle: endAngle})
            })
            .attr('fill', function (d) {
              return file.get(d).color
            })
            .attr('transform', 'translate(200, 200)')
      fileArc.append('circle')
            .attr('cx', 200)
            .attr('cy', 200)
            .attr('r', 11)
            .attr('fill', 'none')
            .attr('stroke-width', '1px')
            .attr('stroke', 'gray')
            .attr('stroke-dasharray', '1,1')
      this.fileArcScale = fileArcScale
      this.fileDomain = fileDomain
      this.rotateAngle = (Math.PI * 2 / this.fileDomain.length - 0.01) / 60
      this.stackScale = d3.scale.linear()
                        .domain([0, this.maxFile.filelen])
                        .range([15, 40])
    },
    realTimeRenderFileMul: function (timeGap) {
      // data structure
      let maxFile = this.maxFile
      let data = this.data
      let originFile = this.originFile
      let peseudoData = this.peseudoData
      let timeMap = data.timeMap
      let fileSumArcMap = this.fileSumArcMap
      let filelenMap = this.filelenMap
      // render detail
      let svg = d3.select('#fileMul').select('svg')
      let fileArcScale = this.fileArcScale
      let stackScale = this.stackScale
      let currTime = this.currTime
      let endTime = this.timeEnd
      let count = this.fileMulCount
      let centerx = this.centerx
      let centery = this.centery
      let stackRadius = this.stackRadius
      let rotateAngle = this.rotateAngle
      // interval
      var fileMulInterval = setInterval(function () {
        if (currTime.getTime() === endTime.getTime()) {
          console.log('filetype over')
          clearInterval(fileMulInterval)
          return
        }
        let time = currTime.getTime()
        let fileMap = new Map()
        let sumArcMap = new Map()
        let sumlen = 0
        for (let i = 0; i < timeGap; i++) {
          if (timeMap.get(time)) {
            let value = timeMap.get(time)
            value.value.forEach(function (file) { // process time data to a peseuso time map
              if (!fileMap.get(file.fileaffix)) {
                let mapValue = {}
                mapValue.fileaffix = file.fileaffix
                mapValue.filelen = parseInt(file.filelen)
                mapValue.count = 1
                mapValue.iscracked = {cracked: 0, sum: 0}
                mapValue.iscracked.cracked = (file.iscracked > 0) ? file.filelen : 0
                mapValue.iscracked.sum = parseInt(file.filelen)
                mapValue.color = originFile.get(file.fileaffix).color
                fileMap.set(file.fileaffix, mapValue)
                sumlen += parseInt(file.filelen)
              } else {
                let mapValue = fileMap.get(file.fileaffix)
                mapValue.filelen += parseInt(file.filelen)
                mapValue.count++
                mapValue.iscracked.cracked = (file.iscracked > 0) ? (mapValue.cracked + file.filelen) : mapValue.cracked
                mapValue.iscracked.sum += parseInt(file.filelen)
                sumlen += parseInt(file.filelen)
              }
            })
          }
          currTime = new Date(currTime.getTime() + 1000)
          time = currTime.getTime()
        }
        let fileArray = [...fileMap]
        fileArray.sort(function (a, b) {
          return a[0] < b[0]
        })
        fileMap = new Map(fileArray)
        if (count.count > 59) {
          d3.select('.fm' + (count.count - 60)).remove()
          d3.select('.fmsum' + (count.count - 60)).remove()
        }
        for (let i = count.count - 1; i > (count.count - 60) && i >= 0; i--) {
          d3.select('.fm' + i).selectAll('.fms')
            .attr('d', function () {
              let fileaffix = '.' + d3.select(this).attr('id').substring(3)
              let startAngle = fileArcScale.get(fileaffix).startAngle + rotateAngle * (count.count - i)
              let endAngle = startAngle + 0.006
              let innerRadius = filelenMap.get(i).get(fileaffix).innerRadius
              let outerRadius = filelenMap.get(i).get(fileaffix).outerRadius
              let arc = d3.svg.arc()
                          .innerRadius(innerRadius)
                          .outerRadius(outerRadius)
              return arc({startAngle: startAngle, endAngle: endAngle})
            })
          let innerRadius = 10 + 2 * (count.count - i)
          let outerRadius = innerRadius + 1
          d3.select('.fm' + i).selectAll('.fmsum')
            .attr('d', function () {
              let fileaffix = d3.select(this).attr('id').substring(5)
              let angle = fileSumArcMap.get(i).get('.' + fileaffix)
              let arc = d3.svg.arc()
                          .innerRadius(innerRadius)
                          .outerRadius(outerRadius)
              return arc(angle)
            })
        }
        let g = svg.append('g')
          .attr('class', function () {
            return 'fm' + count.count
          })
        let accuStartAngle = 0
        for (let file of fileMap.values()) {
          let fileaffix = file.fileaffix
          let stackHeight = 0
          if (file.filelen > maxFile.filelen) {
            stackHeight = 90
          } else {
            stackHeight = Math.ceil(stackScale(file.filelen))
          }
          g.append('path')
            .attr('d', function () {
              let startAngle = fileArcScale.get(fileaffix).startAngle
              let endAngle = startAngle + 0.006
              let innerRadius = stackRadius
              let outerRadius = innerRadius + stackHeight
              if (filelenMap.get(count.count) === undefined) {
                let len = new Map()
                len.set(fileaffix, {innerRadius: innerRadius, outerRadius: outerRadius})
                filelenMap.set(count.count, len)
              } else {
                filelenMap.get(count.count).set(fileaffix, {innerRadius: innerRadius, outerRadius: outerRadius})
              }
              let arc = d3.svg.arc()
                          .innerRadius(innerRadius)
                          .outerRadius(outerRadius)
              return arc({startAngle: startAngle, endAngle: endAngle})
            })
            .attr('fill', function () {
              return fileArcScale.get(fileaffix).color
            })
            .attr('class', 'fms')
            .attr('id', function () {
              return 'fms' + fileaffix.split('.')[1]
            })
            .attr('transform', function () {
              return 'translate(' + centerx + ', ' + centery + ')'
            })
          if (sumlen > 0) {
            g.append('path')
              .attr('d', function () {
                let startAngle = accuStartAngle
                let endAngle = startAngle + file.filelen / sumlen * Math.PI * 2
                accuStartAngle = endAngle
                let innerRadius = 10
                let outerRadius = 11
                let arc = d3.svg.arc()
                            .innerRadius(innerRadius)
                            .outerRadius(outerRadius)
                sumArcMap.set(fileaffix, {startAngle: startAngle, endAngle: endAngle})
                return arc({startAngle: startAngle, endAngle: endAngle})
              })
              .attr('fill', function () {
                return fileArcScale.get(fileaffix).color
              })
              .attr('id', function () {
                return 'fmsum' + fileaffix.split('.')[1]
              })
              .attr('class', 'fmsum')
              .attr('transform', 'translate(200, 200)')
          }
        }
        fileSumArcMap.set(count.count, sumArcMap)
        peseudoData.set(time, fileMap)
        count.count++
      }, this.activateStep)
      this.fileMulInterval = fileMulInterval
    },
    clearInterval: function () {
      clearInterval(this.fileMulInterval)
    }
  },
  mounted: function () {
    this.drawFileTimeMul()
  }
}
</script>

<style scoped>
#fileMul {
  border: 1px solid steelblue;
  /*border-radius: 10px;*/
  width: 410px;
  height: 410px;
  padding: 5px;
  margin-left: 5px;
}
</style>