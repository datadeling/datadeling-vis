import fs from 'fs'
import { createTreemap, createTreemapHierarchical } from './TreemapGenerator.js'
import { ColorTool } from './ColorTool.js'
import { ObjectSet } from './ObjectSet.js'

// config
const filename = '../data/fdk_api_short.json'
const colorMap = { stat: '#ceddef', kommune: '#e0cfee', annet: '#f1dcd0' }
const w = 1200,
  h = 800

const DEBUG = false

// data structures
const datasets = new ObjectSet()
const orgs = new ObjectSet()
const keywords = new ObjectSet()
const errors = []

// Data dump of API: https://kodeverkstad.no/api/fdk_api.php?short
parseFDK(filename)

const color = new ColorTool()
let hex = color.hex(255, 0, 128)
const rgb = color.rgb(color.hex(255, 0, 128))

let maxDatasets = 0
let minDatasets = 10000

orgs.forEach((o) => {
  minDatasets =
    o.datasets.length < minDatasets ? o.datasets.length : minDatasets
  maxDatasets =
    o.datasets.length > maxDatasets ? o.datasets.length : maxDatasets
})

console.log('max datasets', maxDatasets, 'minDatasets', minDatasets)
console.log('map 0.33', map(133, 100, 200))

//// Create data set for simple treemap

const treeData = { data: [], width: w, height: h }
orgs.forEach((o) => {
  treeData.data.push({
    org: o,
    value: o.datasets.length,
    color:
      '#' +
      color.lerp(
        'ffcccc',
        'ff0000',
        map(o.datasets.length, minDatasets, maxDatasets),
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

treeHierachy.data.forEach((cat) => console.log(cat.length))

createTreemapHierarchical(treeHierachy, 'output/FDK-Hierarkisk.svg', w, h)

//////////////////////////
//// Parse FDK dataset

function parseFDK(filename) {
  let rawdata = fs.readFileSync(filename)
  let data = JSON.parse(rawdata)

  data.forEach((el) => {
    datasets.add(el)

    if (el.publisher && !el.publisher.id) el.publisher.id = el.publisher.name
    if (!el.publisher || !el.publisher.id) {
      errors.push(el)
    } else {
      let org = orgs.get(el.publisher.id)
      if (!org) {
        org = {
          id: el.publisher.id,
          prefLabel: el.publisher.prefLabel.nb,
          orgPath: el.publisher.orgPath,
          datasets: [],
        }
        orgs.add(org)
      }

      org.datasets.push(el)
    }

    if (el.keyword) {
      el.keyword.forEach((word) => {
        let str = word.nb
        if (!str) str = word.no
        if (!str) str = word[Object.keys(word)[0]]

        str = str.toLowerCase().trim()
        let keyword = keywords.get(str)

        if (!keyword) {
          keyword = { id: str, datasets: [], dataset: el.id }
          keywords.add(keyword)
          keyword.datasets.push(el)
        } else keyword.datasets.push(el)
      })
    }
  })

  if (DEBUG)
    console.log(
      '--------------------------\n',
      datasets.size() + ' datasets',
      orgs.size() + ' orgs',

      keywords.size() + ' keywords',
      '\n\n',
    )

  orgs.items.sort((a, b) => {
    return b.datasets.length - a.datasets.length
  })

  keywords.items.sort((a, b) => {
    return b.datasets.length - a.datasets.length
  })
}

function map(val, min, max) {
  return (val - min) / (max - min)
}
