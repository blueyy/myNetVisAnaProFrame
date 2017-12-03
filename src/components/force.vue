<template>
<div style='height: 992px; width: 1900px;'>
  <div id='nodesTextandConnect' style='float: left; height: 992px; width: 400px;'>
    <div id='nodesText'>
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
    <div id='nodesConnect'>
    </div>
  </div>
  <div id='nodesFDAandTree' style='overflow: hidden; float: left; width: 1480px; height: 992px;'>
    <div id='nodesFDA'></div>
    <div id='nodesTreeLayout'>
      <button class='btn' @click="treeChange('inner')">Inner</button>
      <button class='btn' @click="treeChange('outer')">Outer</button>
      <button class='btn' @click="treeChange('reserve')">Reserve</button>
      <button class='btn' @click="allSpread(true)">Spread</button>
      <button class='btn' @click="allSpread(false)">Collapse</button>
    </div>
  </div>
</div>
</template>

<script>
import createIP from '../commons/createIP.js'
import createLink from '../commons/createLink.js'
import createDisjointSet from '../commons/createDisjointSet.js'
import createCommunity from '../commons/createCommunity.js'

let ip = createIP()
let ipArr = ([...ip.inner.values()].concat([...ip.outer.values()])).concat([...ip.reserve.values()])
let links = createLink()
let linksArr = [...links.values()]
let originData = {nodesMap: ip, nodes: ipArr, links: linksArr}
let comps = createDisjointSet(originData)

let d3 = require('d3')
export default {
  name: 'force',
  data: function () {
    return {
      ip: ip,
      ipArr: ipArr,
      links: links,
      linksArr: linksArr,
      originData: originData,
      compsMap: comps.map,
      compsArr: comps.arr,
      preComp: {},
      compsNodesRange: [2, 25029],
      compsLinksRange: [1, 75372],
      compsNLRange: [33.21, 200],
      community: {},
      originComm: {},
      preComm: {},
      fdaNodesMap: new Map(),
      fdaNodesArr: [],
      fdaLinksMap: new Map(),
      fdaLinksArr: [],
      currFDANodesMap: new Map(),
      currFDANodesArr: [],
      currFDALinksMap: new Map(),
      currFDALinksArr: [],
      currentLinks: new Map(),
      treeNodesArr: {inner: [], outer: [], reserve: []},
      currTreeNodes: {},
      minSubNet: Infinity,
      maxSubNet: -Infinity,
      coldColor: ['#0088bb', '#0055ff', '#6666ff', '#6699ff', '#9999ff', '#99ccff'],
      collapse: true
    }
  },
  methods: {
    select: function (ip) {
      d3.select(this).attr('cursor', 'pointer')
    },
    createCompPanel: function () {
      let comps = [...this.compsMap]
      let color = this.coldColor
      let width = 400
      let height = 400
      let svg = d3.select('#nodesConnect').append('svg')
                  .attr('width', width)
                  .attr('height', height)
                  .append('g')
                  .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
      let arc = d3.svg.arc()
            .startAngle(function (d) { return d[1].startAngle })
            .endAngle(function (d) { return d[1].endAngle })
            .innerRadius(function (d) { return d[1].innerRadius })
            .outerRadius(function (d) { return d[1].outerRadius })
      let arcs = svg.selectAll('path')
                    .data(comps)
                    .enter()
      arcs.append('path')
          .attr('d', arc)
          .style('fill', function (d) {
            if (d[1].level > 5) {
              return color[5]
            } else {
              return color[d[1].level - 1]
            }
          })
          .style('stroke', function (d) {
            return '#fff'
          })
          .on('mouseover', function (d) {
            d3.select(this)
              .transition()
              .duration(100)
              .style('fill', '#ff9966')
          })
          .on('mouseout', function (d) {
            d3.select(this)
            .transition()
            .duration(100)
            .style('fill', function (d) {
              if (d[1].level > 5) {
                return color[5]
              } else {
                return color[d[1].level - 1]
              }
            })
          })
          .on('click', this.selectComp)
    },
    selectComp: function (comp) {
      if (comp[1].click) {
        window.alert('current communit is ' + comp.key + ', please do not select it again!')
        return
      } else {
        comp[1].click = true
        if (this.preComp) {
          this.preComp.click = false
        }
        this.preComp = comp[1]
        if (d3.select('#nodesFDA').select('svg')) {
          d3.select('#nodesFDA').select('svg').remove()
        }
        let community = createCommunity(comp[1])
        this.community = community.community
        this.originComm = community.originComm
        this.originComm = community.originComm
        if (this.fdaNodesMap) {
          this.fdaNodesMap.clear()
        }
        if (this.fdaLinksMap) {
          this.fdaLinksMap.clear()
        }
        if (this.currFDANodesMap) {
          this.currFDANodesMap.clear()
        }
        if (this.currFDALinksMap) {
          this.currFDALinksMap.clear()
        }
        this.collapse = true
        this.fdaNodesArr = []
        this.fdaLinksArr = []
        this.currFDANodesArr = []
        this.currFDALinksArr = []
        this.currentLinks = comp[1].links
        this.minSubNet = Infinity
        this.maxSubNet = -Infinity
        this.createFDAGraph(this.community)
        this.createTreeData(comp[1].values)
        this.currTreeNodes = {children: this.treeNodesArr.children[0].children.children, key: this.treeNodesArr.children[0].key}
        this.initTreeData()
        this.createTree()
      }
    },
    createFDAGraph: function (comm) {
      if ('click' in comm && comm.click) {
        window.alert('already spread!')
        return
      } else if ('subNet' in comm && comm.subNet.length === 0) {
        window.alert('cannot spread because subNet is empty!')
        return
      } else {
        if ('click' in comm) {
          comm.click = true
        }
        if (this.precomm) {
          this.preComm.click = false
        }
        this.preComm = comm
        let links = this.currentLinks
        let originComm = this.originComm
        let nodesMap = this.fdaNodesMap
        let linksMap = this.fdaLinksMap
        let currFDALinksArr = []
        let currFDALinksMap = new Map()
        let currFDANodesArr = []
        let currFDANodesMap = new Map()
        let minSubNet = this.minSubNet
        let maxSubNet = this.maxSubNet
        if ('subNet' in comm) { // single comm spread graph
          let subNet = comm.subNet
          subNet.forEach(function (value) {
            nodesMap.set(value.key, value)
            currFDANodesMap.set(value.key, value)
            currFDANodesArr.push(value)
            let subNetLen = value.subNet.length
            if (minSubNet > subNetLen) {
              minSubNet = subNetLen
            }
            if (maxSubNet < subNetLen) {
              maxSubNet = subNetLen
            }
            linksMap.set(comm.key + '-' + value.key, {source: comm, target: value})
            currFDALinksMap.set(comm.key + '-' + value.key, {source: comm, target: value})
            currFDALinksArr.push({source: comm, target: value})
          })
        } else {
          for (let value of comm.values()) { // community init graph
            let subNetLen = value.subNet.length
            if (minSubNet > subNetLen) {
              minSubNet = subNetLen
            }
            if (maxSubNet < subNetLen) {
              maxSubNet = subNetLen
            }
            nodesMap.set(value.key, value)
            currFDANodesMap.set(value.key, value)
            currFDANodesArr.push(value)
          }
        }
        this.minSubNet = minSubNet
        this.maxSubNet = maxSubNet
        let count = 0
        if (currFDANodesArr.length > 1) {
          for (let key of links.keys()) {
            let key1 = key.split('-')[0]
            let key2 = key.split('-')[1]
            let s
            let t
            while (!currFDANodesMap.get(key1) && key1) {
              key1 = originComm.get(key1).parent
            }
            if (currFDANodesMap.get(key1)) {
              s = currFDANodesMap.get(key1)
            }
            while (!currFDANodesMap.get(key2) && key2) {
              key2 = originComm.get(key2).parent
            }
            if (currFDANodesMap.get(key2)) {
              t = currFDANodesMap.get(key2)
            }
            if (s && t && key1 !== key2 && !linksMap.get(key1 + '-' + key2) && !linksMap.get(key2 + '-' + key1)) {
              currFDALinksMap.set(key1 + '-' + key2, {source: s, target: t})
              currFDALinksArr.push({source: s, target: t})
              linksMap.set(key1 + '-' + key2, {source: s, target: t})
              linksArr.push({source: s, target: t})
              count++
            }
          }
        }
        console.log('inner connect length ' + count + '!')
        this.currFDALinksArr = currFDALinksArr
        this.currFDALinksMap = currFDALinksMap
        this.currFDANodesArr = currFDANodesArr
        this.currFDANodesMap = currFDANodesMap
        this.fdaNodesArr = this.fdaNodesArr.concat(currFDANodesArr)
        this.fdaLinksArr = this.fdaLinksArr.concat(currFDALinksArr)
        this.createFDA()
      }
    },
    createFDA: function () {
      let height = 960
      let width = 1000
      let links = this.fdaLinksArr
      let nodes = this.fdaNodesArr
      let minSubNet = this.minSubNet
      let maxSubNet = this.maxSubNet
      let circleFill = d3.scale.linear()
      circleFill.domain([minSubNet, maxSubNet])
                .range([0, 255])
      if (d3.select('#nodesFDA').select('svg')) {
        d3.select('#nodesFDA').select('svg').remove()
      }
      let svg = d3.select('#nodesFDA').append('svg')
                .attr('width', width)
                .attr('height', height)
      let force = d3.layout.force()
                    .gravity(0.5)
                    .distance(30)
                    .charge(-80)
                    .size([ width, height ])
      force.nodes(nodes)
          .links(links)
          .start()
      let link = svg.selectAll('.link')
                    .data(links)
                    .enter()
                    .append('line')
                    .attr('x1', function (d) {
                      return d.source.x
                    })
                    .attr('y1', function (d) {
                      return d.source.y
                    })
                    .attr('x2', function (d) {
                      return d.target.x
                    })
                    .attr('y2', function (d) {
                      return d.target.y
                    })
                    .attr('stroke', 'white')
                    .attr('opacity', 0.6)
                    .attr('class', 'link')
      let node = svg.selectAll('.node')
                    .data(nodes)
                    .enter()
                    .append('g')
                    .attr('class', 'node')
                    .call(force.drag)
      link.append('line')
          .attr('x1', function (d) {
            return d.source.x
          })
          .attr('y1', function (d) {
            return d.source.y
          })
          .attr('x2', function (d) {
            return d.target.x
          })
          .attr('y2', function (d) {
            return d.target.y
          })
          .attr('fill', 'none')
      node.append('circle')
          .attr('r', 4)
          .attr('stroke', function (d) {
            let subNetLen = d.subNet.length
            let r = Math.floor(circleFill(subNetLen))
            let g = 255 - r
            return 'rgb(' + r + ',' + g + ',0)'
          })
          .attr('stroke-width', 2)
          .attr('fill', function (d) {
            let subNet = d.subNet
            if (subNet.length > 0) {
              let subNetLen = d.subNet.length
              let r = Math.floor(circleFill(subNetLen))
              let g = 255 - r
              return 'rgb(' + r + ',' + g + ',0)'
            } else {
              return 'white'
            }
          })
          .attr('id', function (d) {
            return d.key
          })
          .on('dblclick', this.createFDAGraph)
      force.on('tick', function () {
        link.attr('x1', function (d) {
          return d.source.x
        })
          .attr('x2', function (d) {
            return d.target.x
          })
          .attr('y1', function (d) {
            return d.source.y
          })
          .attr('y2', function (d) {
            return d.target.y
          })
        node.attr('transform', function (d) {
          return 'translate(' + d.x + ',' + d.y + ')'
        })
      })
    },
    createTreeData: function (nodes) {
      let treeNodesArr = this.treeNodesArr
      treeNodesArr.children = d3.nest().key(function (d) {
        return d.type
      }).entries(nodes)
      for (let i = 0, len = treeNodesArr.children.length; i < len; i++) {
        let child = treeNodesArr.children[i]
        let type = child.key
        if (type === 'inner') {
          child.children = this.createTreeInnerNodes(treeNodesArr.children[i].values)
        } else if (type === 'outer') {
          child.children = this.createTreeOuterNodes(treeNodesArr.children[i].values)
        } else if (type === 'reserve') {
          child.children = this.createTreeReserveNodes(treeNodesArr.children[i].values)
        } else {
          throw new Error('cannot find child type!')
        }
      }
    },
    createTreeInnerNodes: function (nodes) {
      let inner = {}
      inner.children = d3.nest().key(function (d) {
        return d.ipa
      }).entries(nodes)
      inner.children.forEach(function (bitem) {
        bitem.children = []
        bitem.children = d3.nest().key(function (d) {
          return d.ipb
        }).entries(bitem.values)
        // ipc class
        bitem.children.forEach(function (citem) {
          citem.children = []
          citem.children = d3.nest().key(function (d) {
            return d.ipc
          }).entries(citem.values)
          citem.children.forEach(function (ditem) {
            ditem.children = []
            ditem.children = d3.nest().key(function (d) {
              return d.ipd
            }).entries(ditem.values)
          })
        })
      })
      return inner
    },
    createTreeOuterNodes: function (nodes) {
      let outer = {}
      outer.children = d3.nest().key(function (d) {
        return d.add1
      }).entries(nodes)
      outer.children.forEach(function (bitem) {
        bitem.values.forEach(function (d2) {
          if (d2.add2 === undefined) {
            d2.add2 = d2.ip
          }
        })
        bitem.children = d3.nest().key(function (d) {
          return d.add2
        }).entries(bitem.values)
        bitem.children.forEach(function (citem) {
          if (citem.key.split('.').length !== 4) {
            citem.values.forEach(function (dc) {
              if (dc.add3 === undefined) {
                dc.add3 = dc.ip
              }
            })
            citem.children = d3.nest().key(function (d) {
              return d.add3
            }).entries(citem.values)
            citem.children.forEach(function (ditem) {
              if (ditem.key.split('.').length !== 4) {
                ditem.values.forEach(function (d4) {
                  if (d4.add4 === undefined) {
                    d4.add4 = d4.ip
                  }
                })
                ditem.children = d3.nest().key(function (d) {
                  return d.add4
                }).entries(ditem.values)
                ditem.children.forEach(function (eitem) {
                  if (eitem.key.split('.').length !== 4) {
                    eitem.values.forEach(function (d5) {
                      if (d5.add5 === undefined) {
                        d5.add5 = d5.ip
                      }
                    })
                    eitem.children = d3.nest().key(function (d) {
                      return d.add5
                    }).entries(eitem.values)
                    eitem.children.forEach(function (fitem) {
                      if (fitem.key.split('.').length !== 4) {
                        fitem.values.forEach(function (d6) {
                          if (d6.add6 === undefined) {
                            d6.add6 = d6.ip
                          }
                        })
                        fitem.children = d3.nest().key(function (d) {
                          return d.add6
                        }).entries(fitem.values)
                        fitem.children.forEach(function (gitem) {
                          if (gitem.key.split('.').length !== 4) {
                            gitem.children = d3.nest().key(function (d) {
                              return d.ip
                            }).entries(gitem.values)
                          }
                        })
                      }
                    })
                  }
                })
              }
            })
          }
        })
      })
      return outer
    },
    createTreeReserveNodes: function (nodes) {
      let reserve = {}
      reserve.children = d3.nest().key(function (d) {
        return d.add1
      }).entries(nodes)
      reserve.children.forEach(function (bitem) {
        bitem.children = []
        bitem.children = d3.nest().key(function (d) {
          return d.add2
        }).entries(bitem.values)
        // ipc class
        bitem.children.forEach(function (citem) {
          citem.children = []
          citem.children = d3.nest().key(function (d) {
            return d.add3
          }).entries(citem.values)
        })
      })
      return reserve
    },
    initTreeData: function () {
      let root = this.currTreeNodes
      let height = 940
      root.y = height / 2
      root.y0 = root.y
      root.x = 10
      root.x0 = root.x
    },
    treeCollapse: function (d) {
      if (d.children) {
        d._children = d.children
        for (let i = 0, len = d._children.length; i < len; i++) {
          this.treeCollapse(d._children[i])
        }
        d.children = null
      }
    },
    treeSpread: function (d) {
      if (d._children) {
        d.children = d._children
        for (let i = 0, len = d.children.length; i < len; i++) {
          this.treeSpread(d.children[i])
        }
        d._children = null
      }
    },
    spreadTreeNode: function (d) {
      if (d.children) {
        d._children = d.children
        d.children = null
      } else {
        d.children = d._children
        d._children = null
      }
      this.createTree()
    },
    treeChange: function (type) {
      if (this.currTreeNodes.key === type) {
        window.alert('already ' + type + '!')
      } else {
        let find = false
        for (let i = 0, len = this.treeNodesArr.children.length; i < len; i++) {
          let child = this.treeNodesArr.children[i]
          if (type === child.key) {
            if (type === 'inner') {
              child.children = this.createTreeInnerNodes(child.values)
              find = true
            } else if (type === 'outer') {
              child.children = this.createTreeOuterNodes(child.values)
              find = true
            } else if (type === 'reserve') {
              child.children = this.createTreeReserveNodes(child.values)
              find = true
            } else {
              throw new Error('cannot find child type!')
            }
            this.currTreeNodes = {children: child.children.children, key: child.key}
            this.initTreeData()
            this.createTree()
          }
        }
        if (!find) {
          window.alert('this comp does not have ' + type + ' nodes!')
        }
      }
    },
    createTree: function () {
      // console.log(root)
      if (d3.select('#nodesTreeLayout').select('svg')) {
        d3.select('#nodesTreeLayout').select('svg').remove()
      }
      let root = this.currTreeNodes
      let ipCurrentDepth = 65
      let width = 940
      let height = 450
      let margin = 10
      let svg = d3.select('#nodesTreeLayout').append('svg')
                  .attr('width', height)
                  .attr('height', width)
      let diagonal = d3.svg.diagonal()
                        .projection(function (d) {
                          return [d.x, d.y]
                        })
      let tree = d3.layout.tree()
                  .size([width, height])
                  .separation(function (a, b) {
                    return (a.parent === b.parent ? 10 : 15)
                  })
      let nodes = tree.nodes(root).reverse()
      width = Math.max(nodes.length * 15, 940)
      svg.attr('height', width)
      tree.size([width, height])
      let minX = Infinity
      let maxX = -Infinity
      minX = d3.min(nodes, function (d) {
        return d.x
      })
      maxX = d3.max(nodes, function (d) {
        return d.x
      })
      let scaleX
      if (minX !== maxX) {
        scaleX = (width - margin * 4) / (maxX - minX)
      }
      nodes.forEach(function (node) {
        let x = (scaleX) ? ((node.x - minX) * scaleX + margin * 2) : node.x
        node.x = node.depth * ipCurrentDepth + 20 + margin
        node.y = x
        node.x0 = node.x
        node.y0 = node.y
      })
      let links = tree.links(nodes)
      let node = svg.selectAll('.node')
                    .data(nodes)
                    .enter()
                    .append('g')
                    .attr('class', 'node')
                    .attr('transform', function (d) {
                      return 'translate(' + d.x0 + ',' + d.y0 + ')'
                    })
      let nodeEnter = node.append('g')
                          .attr('class', 'node')
                          .on('mouseover', function () {
                            d3.select(this).attr('cursor', 'pointer')
                          })
                          .on('click', this.spreadTreeNode)
      nodeEnter.append('circle')
              .attr('fill', function (d) {
                return d.children || d._children ? 'green' : 'red'
              })
              .attr('r', 0.000001)
      let textEnter = node.append('g')
                          .attr('class', 'text')
      textEnter.append('text')
              .attr('y', -5)
              .attr('text-anchor', function (d) {
                // return d.children || d._children ? 'end' : 'start'
                return 'start'
              })
              // .attr('transform', function (d) {
              //   // console.log(d.key, this.textLength)
              //   if (d.depth > 0 && (d.children || d._children)) {
              //     return 'rotate(90)'
              //   } else if (d.depth > 0 && !d.children && !d._children) {
              //     return 'rotate(-90)'
              //   }
              // })
              .text(function (d) {
                return d.key || d.ip
              })
              .attr('fill', 'white')
              .style('font-size', '2px')
              .style('font-family', 'verdana,arial,sans-serif')
      let nodeTransition = node.transition()
                              .duration(750)
                              .attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')' })
      nodeTransition.select('circle')
                    .attr('r', 4)
      let link = svg.selectAll('.link')
                    .data(links)
      link.enter()
          .append('path')
          .attr('class', 'link')
          .attr('d', function (d) {
            let s = {
              x: d.source.x0 || -Infinity,
              y: d.source.y0 || -Infinity
            }
            let t = {
              x: d.target.x0 || -Infinity,
              y: d.target.y0 || -Infinity
            }
            return diagonal({
              source: s,
              target: t
            })
          })
          .attr('fill', 'none')
          .attr('stroke', 'white')
          .attr('stroke-width', 0.5)
          .attr('opacity', 1)
      link.transition()
          .duration(750)
          .attr('d', diagonal)
          .attr('stroke', 'white')
      nodes.forEach(function (d) {
        d.x0 = d.x
        d.y0 = d.y
      })
    },
    allSpread: function (bool) {
      if (this.collapse !== bool) {
        this.collapse = bool
        let root = this.currTreeNodes
        let height = 940
        root.y = height / 2
        root.y0 = root.y
        root.x = 10
        root.x0 = root.x
        let len = root.children.length
        if (!bool) {
          for (let i = 0; i < len; i++) {
            this.treeCollapse(root.children[i])
          }
        } else {
          for (let i = 0; i < len; i++) {
            this.treeSpread(root.children[i])
          }
        }
        this.createTree()
      }
    }
  },
  mounted: function () {
    this.createCompPanel()
  }
}
</script>

<style scoped>
#nodesTextandConnect {
  overflow: hidden;
}
#nodesText, #nodesConnect, #nodesFDA, #nodesTreeLayout {
  margin-top: 25px;
  border: 1px solid steelblue;
},
#nodesText {
  width: 400px;
  height: 560px;
  overflow-y: scroll;
  overflow-x: hidden;
}
#nodesConnect {
  width: 400px;
  height: 400px;
  margin-top: 0px;
  overflow: hidden;
}
#nodesFDA {
  width: 1000px;
  height: 962px;
  float: left;
  overflow: hidden;
}
#nodesTreeLayout {
  width: 476px;
  height: 962px;
  overflow-y: scroll;
  overflow-x: hidden;
  float: left;
}
table {
  width: 383px;
  font-size: 3px;
  border-collapse: collapse;
  color: white;
}
tr {
  height: 22px;
}
td, th {
  height: 20px;
  overflow: hidden;
  border: 1px solid steelblue;
}
button {
  overflow: hidden;
}
button:hover {
  background-color: hsl(194, 66%, 41%);
}
.btn {
  width: 81px;
  height: 35px;
  color: hsl(0, 0%, 100%);
  background-color: hsl(194, 66%, 61%);
  border-color: hsl(194, 67%, 56%);
  display: inline-block;
  padding: 6px 12px;
  margin-top: 5px;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.42857143;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  cursor: pointer;
  background-image: none;
  border: 1px solid hsla(0, 0%, 0%, 0);
  border-radius: 4px;
}
</style>