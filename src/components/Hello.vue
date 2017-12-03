<template>
  <div class="hello">
    <!-- header -->
    <div id='top' style='width: 1900px; height: 40px;'>
      <span style='float: left; margin-left: 15px; font-size: 20px; font-family: Arial; color: steelblue;'><b>Network Security Visualization Based on MulElemVis Framework</b></span>
      <input @click="changeVis('mul')" type='button' class='button blue' style='float: right; margin-right: 15px;' value='MulVariate Analysis'></input>
      <input @click="changeVis('force')" type='button' class='button blue' style='float: right; margin-right: 15px;' value='NetStructure Analysis'></input>
    </div>
    <!-- content -->
    <mul-variate id='mul'></mul-variate>
    <force id='force' style='display: none;'></force>
    <!-- footer -->
    <div id='bottom' style='width: 1900px; height: 30px; margin-top: 900px;'>
      <span style='font-size: 15px; font-family: Arial; margin-top: 10px; color: steelblue;'>Copyright © 2017 by&nbsp;<a href='https://github.com/blueyy' target='_blank'><img src='../assets/img/github.png' style='width: 15px; height: 15px; margin-top: 10px;'>&nbsp;LuanXinyue</a></span>
    </div>
  </div>
</template>

<script>
import mulVariate from './mulVariate.vue'
import force from './force.vue'
export default {
  name: 'hello',
  data () {
    return {
      currentVis: 'mul'
    }
  },
  components: {
    mulVariate,
    force
  },
  methods: {
    changeVis: function (type) {
      if (type !== this.currentVis) {
        if (type === 'force') {
          document.getElementById('bottom').style.marginTop = '970px'
        } else {
          document.getElementById('bottom').style.marginTop = '900px'
        }
        document.getElementById(this.currentVis).style.display = 'none'
        document.getElementById(type).style.display = 'inline'
        this.currentVis = type
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.button {
  display: inline-block;
  outline: none;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  font: 16px/100% 'Microsoft yahei',Arial,Helvetica, sans-serif;
  padding: .5em 2em .55em;
  text-shadow: 0 1px 1px rgba(0,0,0,.3);
  border-radius: .5em;
  box-shadow: 0 1px 2px rgba(0,0,0,.2);
}
.button:hover {
  text-decoration: none;
}
.button:active {
  position: relative;
  top: 1px;
}
.blue {
  color: #d9eef7;
  border: solid 1px #0076a3;
  background: #0095cd;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#00adee', endColorstr='#0078a5');
}
.blue:hover {
  background: #007ead;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#0095cc', endColorstr='#00678e');
}
.blue:active {
  color: #80bed6;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#0078a5', endColorstr='#00adee');
}

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
  text-decoration: none;
}
a:hover {
  cursor: pointer;
  text-decoration: none;
}
div {
  background-color: black;
}
</style>
