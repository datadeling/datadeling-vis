import {
  createTreemap,
  createTreemapHierarchical,
} from './lib/TreemapGenerator.js'
import { ColorTool } from './lib/ColorTool.js'
import { parseFDK } from './lib/FDKData.js'

// config
const DEBUG = false
const filename = '../data/fdk_api_short.json'
const colorMap = { stat: '#ceddef', kommune: '#e0cfee', annet: '#f1dcd0' }
const w = 1200,
  h = 800

// Data dump of API: https://kodeverkstad.no/api/fdk_api.php?short
const fdk = parseFDK(filename)

const color = new ColorTool()
let hex = color.hex(255, 0, 128)
const rgb = color.rgb(color.hex(255, 0, 128))

console.log(
  '\n--------------------- FDK TREEMAPS\n\n',
  'max datasets',
  fdk.maxDatasets,
  'minDatasets',
  fdk.minDatasets,
  '\n',
)

//// Create data set for simple treemap

const treeData = { data: [], width: w, height: h }
fdk.orgs.forEach((o) => {
  treeData.data.push({
    org: o,
    value: o.datasets.length,
    color:
      '#' +
      color.lerp(
        'ffcccc',
        'ff0000',
        map(o.datasets.length, fdk.minDatasets, fdk.maxDatasets),
      ),
    label: o.prefLabel,
  })
})

createTreemap(treeData, 'output/FDK-datadeling-enkel.svg', w, h)

//// Divide data into categories for STAT, KOMMUNE, ANNET to create
//// hierarchical treemap

let STAT = 0,
  KOMMUNE = 1,
  ANNET = 2

let treeHierachy = {
  width: w,
  height: h,
  data: [[], [], []],
}

treeData.data.forEach((el) => {
  if (!el.org.publisher && DEBUG) console.log(el.label, el.org)
  if (el.org.orgPath) {
    if (el.org.orgPath.startsWith('/STAT')) el.color = '#ceddef'
    else if (el.org.orgPath.startsWith('/KOMM')) el.color = '#e0cfee'
    else el.color = '#f1dcd0'
  }
})

treeData.data.forEach((o) => {
  if (o.org.orgPath.startsWith('/KOMM')) treeHierachy.data[KOMMUNE].push(o)
  else if (o.org.orgPath.startsWith('/STAT')) treeHierachy.data[STAT].push(o)
  else treeHierachy.data[ANNET].push(o)
})

createTreemapHierarchical(treeHierachy, 'output/FDK-Hierarkisk.svg', w, h)
