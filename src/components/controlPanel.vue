<template>
  <div>
    <div id='legends'>
      <div id='fileLegends'></div>
      <div id='portLegends'></div>
      <div id='pipeLegends'></div>
    </div>
    <div id='timeControl'>
      <div id='timeStart'></div>
      <div id='timeZoom'></div>
      <div id='timeLine'></div>
    </div>
  </div>
</template>

<script type="text/javascript">
let d3 = require('d3')
export default {
  props: ['activateStep', 'originFile', 'originPort', 'originPipe', 'timeStart', 'timeEnd', 'currTime'],
  data: function () {
    return {
      start: false,
      end: { end: false },
      fileWidth: 620,
      fileHeight: 70,
      portWidth: 310,
      portHeight: 70,
      pipeWidth: 920,
      pipeHeight: 70,
      rectWidth: 15,
      rectStep: 20,
      rectMargin: 10,
      timeLineMaxWidth: 144000,
      timeLineMidWidth: 14000,
      timeLineMinWidth: 1550,
      timeLineWidth: 144000,
      timeLineHeight: 70,
      timeLineStart: 5,
      timeLineType: 'Min-H-D-Mon',
      timeAxisTop: {},
      timeAxisBott: {},
      timeScale: {},
      timeCursorWidth: 1.525,
      zh: d3.locale({
        decimal: '.',
        thousands: ',',
        grouping: [3],
        currency: ['¥', ''],
        dateTime: '%a %b %e %X %Y',
        date: '%Y/%-m/%-d',
        time: '%H:%M:%S',
        periods: ['Moring', 'Afternoon'],
        days: ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'],
        shortDays: ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'],
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
        shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
      }),
      timeInterval: {},
      timeCount: {count: 0},
      timeGap: 1
    }
  },
  methods: {
    drawLegends: function (id, width, height, map) {
      let step = this.rectStep
      let rectWidth = this.rectWidth
      let rectMargin = this.rectMargin
      let svg = d3.select('#legends').select('#' + id).append('svg')
                  .attr('width', width)
                  .attr('height', height)
      let i = 0
      for (let item of map.entries()) {
        let key = item[0]
        let value = item[1]
        let g = svg.append('g')
                .attr('class', key)
        g.append('rect')
          .attr('x', step * i + rectWidth / 2)
          .attr('y', 2)
          .attr('width', rectWidth)
          .attr('height', rectWidth)
          .attr('fill', value.color)
        g.append('text')
          .text(key)
          .attr('x', step * i + rectWidth)
          .attr('y', rectWidth + rectMargin)
          .attr('transform', function () {
            return 'rotate(45,' + (step * i + rectWidth) + ' ' + (rectWidth) + ')'
          })
          .attr('fill', 'white')
          .style('font-family', 'Arial')
          .style('font-size', '3px')
        i++
      }
    },
    createTimeLine: function () {
      // time start
      let startSvg = d3.select('#timeStart')
                      .append('svg')
                      .attr('width', 90)
                      .attr('height', 60)
      startSvg.append('rect')
              .attr('x', 5)
              .attr('y', 5)
              .attr('rx', 10)
              .attr('ry', 10)
              .attr('width', 75)
              .attr('height', 30)
              .attr('fill', '#99cc00')
              .attr('stroke', '#99cc66')
              .attr('stroke-width', '5px')
              .attr('id', 'timeActivateRect')
      startSvg.append('text')
              .attr('x', 18)
              .attr('y', 25)
              .text('START')
              .attr('font-family', 'Arial')
              // .attr('font-size', '10px')
              .attr('fill', 'white')
              .attr('id', 'timeActivateText')
              .on('mouseover', function () {
                d3.select(this).style('cursor', 'pointer')
              })
              .on('click', this.timeActivate)
      // time zoom
      let zoomID = ['Min-H-D-Mon', 'H-D-Mon', 'D-Mon', 'Mon']
      let zoomSvg = d3.select('#timeZoom').append('svg')
                      .attr('width', 160)
                      .attr('height', 60)
      zoomSvg.selectAll('circle')
              .data(['plus', 'sub'])
              .enter()
              .append('circle')
              .attr('cx', 13)
              .attr('cy', function (d, i) {
                return 25 * i + 12
              })
              .attr('r', 11)
              .attr('fill', '#99cccc')
              .attr('id', function (d) {
                return 'timeZoom' + d
              })
              .on('mouseover', function () {
                d3.select(this).style('cursor', 'pointer')
              })
      let timeCursorExtend = this.timeCursorExtend
      zoomSvg.selectAll('text')
            .data(['plus', 'sub'])
            .enter()
            .append('text')
            .attr('x', 5)
            .attr('y', function (d, i) {
              return 22 * i + 20
            })
            .text(function (d, i) {
              if (i === 0) {
                return '+'
              } else {
                return '--'
              }
            })
            .attr('fill', 'white')
            .attr('font-size', '25px')
            .attr('font-family', 'Arial')
            .on('mouseover', function () {
              d3.select(this).style('cursor', 'pointer')
            })
            .on('click', function (d) {
              timeCursorExtend(d)
            })
      let zoomG = zoomSvg.append('g')
      let timeLineChag = this.timeLineChag
      zoomG.selectAll('rect')
            .data(zoomID)
            .enter()
            .append('rect')
            .attr('y', function (d, i) {
              return i * 12 + 2
            })
            .attr('x', 30)
            .attr('width', 40)
            .attr('height', 10)
            .attr('fill', 'gray')
            .attr('opacity', '0.5')
            .attr('class', function (d) {
              return 'timeZoom' + d
            })
            .on('mouseover', function () {
              if (this.end === false) {
                d3.select(this).style('cursor', 'no-drop')
              } else {
                d3.select(this).style('cursor', 'pointer')
              }
            })
            .on('click', function (d, i) {
              timeLineChag(d)
            })
      zoomG.selectAll('text')
            .data(zoomID)
            .enter()
            .append('text')
            .attr('y', function (d, i) {
              return i * 13 + 10
            })
            .attr('x', 78)
            .text(function (d) {
              return d
            })
            .attr('fill', 'white')
            .attr('font-family', 'Arial')
            .attr('font-size', '3px')
            .attr('opacity', '0.5')
            .attr('class', function (d) {
              return 'timeZoom' + d
            })
      d3.selectAll('.timeZoom' + this.timeLineType).attr('opacity', 1)
      // time line axis
      let zh = this.zh
      let svg = d3.select('#timeLine').append('svg')
                  .attr('width', this.timeLineMaxWidth)
                  .attr('height', this.timeLineHeight)
                  .style('position', 'relative')
      let timeLineStart = this.timeLineStart
      let timeLineWidth = this.timeLineWidth
      let timeScale = d3.time.scale()
                        .domain([this.timeStart, this.timeEnd])
                        .range([timeLineStart, timeLineWidth - 100])
      this.timeScale = timeScale
      let timeAxisTop = d3.svg.axis()
                          .scale(timeScale)
                          .tickFormat(zh.timeFormat('%H:%M-%-m/%-d'))
                          .ticks(d3.time.minute, 1)
      this.timeAxisTop = timeAxisTop
      let timeAxisBott = d3.svg.axis()
                        .scale(timeScale)
                        .tickFormat(zh.timeFormat('%S'))
                        .orient('top')
                        .ticks(d3.time.second, 10)
      this.timeAxisBott = timeAxisBott
      svg.append('g')
        .attr('class', 'timeAxisTop')
        .attr('fill', 'none')
        .attr('stroke', 'gray')
        .attr('transform', 'translate(0, 15)')
        .call(timeAxisTop)
      svg.append('g')
        .attr('class', 'timeAxisBott')
        .attr('fill', 'none')
        .attr('stroke', 'gray')
        .call(timeAxisBott)
      d3.select('.timeAxisTop').selectAll('text')
        .attr('stroke', 'none')
        .attr('fill', 'steelblue')
        .attr('font-family', 'Arial')
        .attr('font-size', '3px')
        .attr('fill', 'white')
        .attr('transform', 'translate(30, -13)')
      d3.select('.timeAxisBott').selectAll('text')
        .attr('stroke', 'none')
        .attr('fill', 'steelblue')
        .attr('font-family', 'Arial')
        .attr('font-size', '3px')
        .attr('fill', 'white')
      d3.select('.timeAxisBott').attr('transform', 'translate(0, 40)')
      d3.select('.timeAxisBott').selectAll('text').attr('transform', 'translate(5, 20)rotate(60,-10 -10)')
      // time line axis - bg
      let bgDrag = d3.behavior.drag()
                    .on('drag', function () {
                      d3.select(this).style('cursor', 'move')
                      document.getElementById('timeLine').scrollLeft += d3.event.dx
                    })
      svg.append('rect')
          .attr('x', this.timeLineStart)
          .attr('y', 16)
          .attr('width', this.timeLineWidth - 105)
          .attr('height', 24)
          .attr('fill', '#ffcccc')
          .attr('opacity', '0.5')
          .attr('id', 'timeLineBg')
          .call(bgDrag)
      // time line axis - cursor
      let timeCursorDrag = this.timeCursorDrag
      let cursorDrag = d3.behavior.drag()
                        .on('drag', function () {
                          d3.select(this).style('cursor', 'pointer')
                          timeCursorDrag()
                        })
      svg.append('rect')
          .attr('x', 5)
          .attr('y', 16)
          .attr('width', this.timeCursorWidth)
          .attr('height', 24)
          .attr('fill', '#99cccc')
          .attr('opacity', '0.7')
          .attr('mouseover', function () {
            d3.select(this).style('cursor', 'move')
          })
          .attr('id', 'timeLineCursor')
          .style('position', 'fixed')
          .call(cursorDrag)
    },
    timeActivate: function () {
      if (this.end.end) {
        window.alert('Display Over!')
        return
      }
      let text = d3.select('#timeActivateText').text()
      if (text === 'START') {
        text = 'PAUSE'
        d3.select('#timeActivateRect').attr('fill', '#99cc66').attr('stroke', '#99cc00')
        this.start = true
        this.$emit('activate', true)
      } else {
        text = 'START'
        d3.select('#timeActivateRect').attr('fill', '#99cc00').attr('stroke', '#99cc66')
        this.start = false
        this.$emit('activate', false)
      }
      d3.select('#timeActivateText').text(text)
    },
    timeStop: function () {
      this.end = true
      this.start = false
      this.$emit('activate', false)
      d3.select('#timeActivateText').text('START')
    },
    timeBgDrag: function () {
      let startx = this.timeLineStart
      let endx = this.timeLineWidth - 100 - this.timeCursorWidth
      d3.select(this).style('cursor', 'move')
      document.getElementById('timeLine').scrollLeft += d3.event.dx
      d3.select('#timeLineCursor').attr('x', function () {
        let x = parseInt(d3.select(this).attr('x'))
        let dx = d3.event.dx
        console.log(x, dx)
        if (x === startx && dx < 0) {
          return x
        } else if (x === endx && dx > 0) {
          return x
        } else {
          return (dx + x)
        }
      })
    },
    timeCursorDrag: function () {
      let x = d3.event.x
      let rect = d3.select('#timeLineCursor')
      let oldx = parseInt(rect.attr('x') + rect.attr('width') / 2)
      let dist = parseInt(x - oldx)
      let newx = Math.min(Math.max((oldx + dist), 5), (this.timeLineWidth - 100 - rect.attr('width')))
      rect.attr('x', newx)
    },
    timeCursorExtend: function (text) {
      let plus = text
      let width = parseFloat(d3.select('#timeLineCursor').attr('width'))
      if (plus === 'plus' && width <= (parseFloat(this.timeLineWidth) - 100 - parseFloat(this.timeCursorWidth))) {
        d3.select('#timeLineCursor').attr('width', width + parseFloat(this.timeCursorWidth))
      } else if (plus === 'sub' && width > this.timeCursorWidth) {
        d3.select('#timeLineCursor').attr('width', width - parseFloat(this.timeCursorWidth))
      }
    },
    timeLineChag: function (type) {
      if (type === this.timeLineType || this.start) {
        return
      }
      d3.selectAll('.timeZoom' + this.timeLineType).attr('opacity', 0.5)
      this.timeLineType = type
      d3.selectAll('.timeZoom' + type).attr('opacity', 1)
      let width = 0
      if (type === 'Min-H-D-Mon') {
        width = parseInt(this.timeLineMaxWidth)
      } else if (type === 'H-D-Mon') {
        width = parseInt(this.timeLineMidWidth)
      } else {
        width = parseInt(this.timeLineMinWidth)
      }
      this.timeLineWidth = width
      this.timeScale.range([this.timeLineStart, width - 100])
      d3.select('#timeLine').select('svg').attr('width', width)
      let cursorWidth = 0
      let timeGap = 0
      switch (type) {
        case 'Min-H-D-Mon':
          this.timeAxisTop.scale(this.timeScale).tickFormat(this.zh.timeFormat('%H:%M-%-m/%-d')).ticks(d3.time.minute, 1)
          this.timeAxisBott.scale(this.timeScale).tickFormat(this.zh.timeFormat('%S')).ticks(d3.time.second, 10)
          timeGap = 1
          break

        case 'H-D-Mon':
          this.timeAxisTop.scale(this.timeScale).tickFormat(this.zh.timeFormat('%H-%m/%d')).ticks(d3.time.hour, 1)
          this.timeAxisBott.scale(this.timeScale).tickFormat(this.zh.timeFormat('%M')).ticks(d3.time.minute, 1)
          timeGap = 60 * 1
          break

        case 'D-Mon':
          this.timeAxisTop.scale(this.timeScale).tickFormat(this.zh.timeFormat('%m/%d')).ticks(d3.time.day, 1)
          this.timeAxisBott.scale(this.timeScale).tickFormat(this.zh.timeFormat('%H')).ticks(d3.time.hour, 1)
          timeGap = 60 * 60
          break

        case 'Mon':
          this.timeAxisTop.scale(this.timeScale).tickFormat(this.zh.timeFormat('%m')).ticks(d3.time.month, 1)
          this.timeAxisBott.scale(this.timeScale).tickFormat(this.zh.timeFormat('%d')).ticks(d3.time.day, 1)
          timeGap = 60 * 60 * 24
          break
      }
      cursorWidth = this.timeScale(Math.min(new Date(this.timeStart.getTime() + timeGap * 1000), this.timeEnd)) - this.timeScale(this.timeStart)
      this.timeCursorWidth = cursorWidth
      d3.select('#timeLineCursor').attr('width', cursorWidth).attr('x', this.timeLineStart)
      d3.select('#timeLineBg').attr('width', width - 105)
      d3.select('.timeAxisTop').call(this.timeAxisTop)
      d3.select('.timeAxisBott').call(this.timeAxisBott)
      d3.select('.timeAxisTop').selectAll('text')
        .attr('stroke', 'none')
        .attr('fill', 'steelblue')
        .attr('font-family', 'Arial')
        .attr('font-size', '3px')
        .attr('transform', 'translate(30, -13)')
      d3.select('.timeAxisBott').selectAll('text')
        .attr('stroke', 'none')
        .attr('fill', 'steelblue')
        .attr('font-family', 'Arial')
        .attr('font-size', '3px')
        .attr('transform', 'translate(5, 20)rotate(60,-10 -10)')
      this.timeGap = timeGap
      this.$emit('changeTimeGap', timeGap)
    },
    cursorRealTimeRender: function (timeGap) {
      let step = this.timeCursorWidth
      let count = this.timeCount
      let endTime = this.timeEnd
      let currTime = this.currTime
      let end = this.end
      var timeInterval = setInterval(function () {
        if (currTime.getTime() === endTime.getTime()) {
          console.log('time over')
          d3.select('#timeActivateText').text('START')
          d3.select('#timeActivateRect').attr('fill', '#99cc00').attr('stroke', '#99cc66')
          end.end = true
          clearInterval(timeInterval)
          return
        }
        d3.select('#timeLineCursor').attr('transform', function () {
          return 'translate(' + (step * count.count) + ',0)'
        })
        document.getElementById('timeLine').scrollLeft += step
        currTime = new Date(currTime.getTime() + 1000 * timeGap)
        count.count++
      }, this.activateStep)
      this.timeInterval = timeInterval
    },
    clearInterval: function () {
      clearInterval(this.timeInterval)
    }
  },
  mounted: function () {
    this.drawLegends('fileLegends', this.fileWidth, this.fileHeight, this.originFile)
    this.drawLegends('portLegends', this.portWidth, this.portHeight, this.originPort)
    this.drawLegends('pipeLegends', this.pipeWidth, this.pipeHeight, this.originPipe)
    this.createTimeLine()
  }
}
</script>

<style scoped>
#legends {
  width: 1900px;
  height: 70px;
}
#fileLegends, #portLegends, #pipeLegends {
  float: left;
  margin-left: 15px;
}
#timeStart, #timeZoom, #timeLine {
  float: left;
  margin-left: 15px;
}
#timeLine {
  width: 1570px;
  border-radius: 2px;
  overflow: hidden;
}
</style>