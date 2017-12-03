<template>
  <div class="mulVariate">
    <control-panel ref="time" v-on:changeTimeGap="changeTimeGap" v-on:activate="activate" :activateStep="activateStep" :originFile="originFile" :originPort="originPort" :originPipe="originPipe" :timeStart="timeStart" :timeEnd="timeEnd" :currTime="currTime"></control-panel>
    <div style='float: left;'>
      <file ref="file" :data="data" :activateStep="activateStep" :originFile="originFile" :minFile="minFile" :maxFile="maxFile" :timeEnd="timeEnd" :currTime="currTime" style='clear: both;'></file>
      <port ref="port" :data="data" :activateStep="activateStep" :originPort="originPort" :minFile="minFile" :maxFile="maxFile" :timeEnd="timeEnd" :currTime="currTime" style='clear: both;'></port>
    </div>
    <pipe ref="pipe" :data="data" :activateStep="activateStep" :originPipe="originPipe" :originIPRelate="originIPRelate" :minFile="minFile" :maxFile="maxFile" :timeEnd="timeEnd" :currTime="currTime"></pipe>
    <radars ref="radars" :data="data" :activateStep="activateStep" :maxFile="maxFile" :timeEnd="timeEnd" :currTime="timeStart"></radars>
    <!-- <mul-time></mul-time> -->
    <!-- <text-info></text-info> -->
    <!-- <button @click='printScreen'>截图</button> -->
  </div>
</template>

<script>
import createFile from '../commons/createFile.js'
import createPort from '../commons/createPort.js'
import createPipe from '../commons/createPipe.js'
import createData from '../commons/createData.js'
import createIPRelate from '../commons/createIPRelate.js'

import controlPanel from './controlPanel.vue'
import file from './file.vue'
import port from './port.vue'
import pipe from './pipe.vue'
import radars from './radars.vue'
import mulTime from './mulTime.vue'
import textInfo from './textInfo.vue'

let d3 = require('d3')
let html2canvas = require('html2canvas')
export default {
  name: 'mulVariate',
  data () {
    return {
      originFile: createFile(),
      originPort: createPort(),
      originPipe: createPipe(),
      originIPRelate: createIPRelate(),
      data: createData(),
      timeStart: new Date('07 31,2015 16:00:00'),
      timeEnd: new Date('08 01,2015 15:00:00'),
      currTime: new Date('07 31,2015 16:00:00'),
      minFile: { sumlen: 2048, filelen: 2048, count: 1, iscracked: 0.1 },
      maxFile: { sumlen: 3500000, filelen: 700000, count: 50, iscracked: 1, file: 8, pipe: 8, atm: 3, port: 8, ip: 100 },
      start: false,
      imgCount: {count: 0},
      img: [],
      timeGap: 1,
      activateStep: 500
    }
  },
  components: {
    controlPanel,
    file,
    port,
    pipe,
    radars,
    mulTime,
    textInfo
  },
  methods: {
    activate: function (bool) {
      let gap = this.timeGap
      if (bool) {
        this.$refs.file.realTimeRenderFileMul(gap)
        this.$refs.port.realTimeRenderPortMul(gap)
        this.$refs.pipe.realTimeRenderPipeConnect(gap)
        this.$refs.pipe.realTimeRenderPipeArea(gap)
        this.$refs.radars.realTimeRenderRadars(gap)
        this.$refs.time.cursorRealTimeRender(gap)
      } else {
        this.$refs.file.clearInterval()
        this.$refs.port.clearInterval()
        this.$refs.pipe.clearInterval()
        this.$refs.radars.clearInterval()
        this.$refs.time.clearInterval()
      }
    },
    changeTimeGap: function (gap) {
      this.timeGap = gap
    },
    printScreen: function () {
      let imgUri = ''
      let count = this.imgCount
      let imgArray = this.img
      html2canvas(document.body, {
        'onrendered': function (canvas) {
          // count.count++
          imgUri = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream')
          imgArray.push(imgUri)
          // let div = d3.select('#mulTime')
          // let odiv = div.createElement('div')
          // document.body.appendChild(odiv)
          // odiv.id = 'div' + count.count
          // let mydiv = document.getElementById('div' + count.count)
          // let newImg = document.createElement('img')
          // newImg.width = '400'
          // newImg.height = '300'
          // newImg.src = imgUri
          // mydiv.appendChild(newImg)
          // childDiv.style.width = '400px'
          // childDiv.style.height = '300px'
          // let svg = childDiv.append('svg').attr('height', 300).attr('width', 400)
          // svg.append('rect').attr('id', 'rect' + count.count).attr('x', 0).attr('y', 0).attr('width', 400).attr('height', 300)
          // newImg.src = imgUri
          // childDiv.appendChild(newImg)
          var saveLink = document.createElement('a')
          saveLink.href = imgUri
          saveLink.download = 'test' + count.count + '.png'
          saveLink.click()
        }
      })
      let rect = d3.select('#rect' + count.count)
      rect.attr('fill', function () { return 'url(./test' + count.count + '.png)' })
      count.count++
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
