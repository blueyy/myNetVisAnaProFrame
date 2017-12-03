<template>
  <div id='textInfo'>
    <table>
      <thead>
        <tr>
          <th>Key</th>
          <th>Nodes</th>
          <th>Links</th>
          <th>N/L</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for='(item, index) in this.compsArr'>
          <td @click='select(item.key)'>{{item.key}}</td>
          <td>{{item.valueLen}}</td>
          <td>{{item.linkLen}}</td>
          <td>{{(item.valueLen / item.linkLen * 100).toFixed(2)}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data: function () {
    return {}
  },
  methods: {},
  mounted: function () {}
}
</script>

<style scoped>
#textInfo {
  width: 375px;
  height: 842px;
  border: 1px solid steelblue;
  float: left;
  overflow-y: scroll;
}
</style>