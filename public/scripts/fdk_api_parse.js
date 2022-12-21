import fs from 'fs'
import { getTreemap } from 'treemap-squarify'
import { createTreemap } from './treemap_generator.js'
import { parseMunicipalityMap } from './municipalities.js'
import { ColorTool } from './colorTool.js'
import { ObjectSet } from './objectSet.js'

const datasets = new ObjectSet()
const orgs = new ObjectSet()
const keywords = new ObjectSet()
const errors = []

// Data dump of API: https://kodeverkstad.no/api/fdk_api.php?short
const filename = '../data/fdk_api_short.json'

let rawdata = fs.readFileSync(filename)
let data = JSON.parse(rawdata)

function getLabel(obj) {}

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

console.log(
  '--------------------------\n',
  datasets.size() + ' datasets',
  orgs.size() + ' orgs',

  keywords.size() + ' keywords',
  '\n\n',
)

// console.log('id;name;datasets')
// orgs.forEach((o) => {
//   console.log(`${o.id};${o.prefLabel};${o.datasets.length}`)
// })

orgs.items.sort((a, b) => {
  return b.datasets.length - a.datasets.length
})

keywords.items.sort((a, b) => {
  return b.datasets.length - a.datasets.length
})

// let word = keywords.get('energi')
// word.datasets.forEach((el) => {
//   console.log(el.publisher.prefLabel.nb)
// })

// console.log('--------------------------\n', '\n\n')
// console.log('keyword;datasets')
// let w = []
// keywords.forEach((word) => w.push(word.id))
// w.forEach((word) => {
//   let item = keywords.get(word)
//   console.log(`${word};${item.datasets.length}`)
// })

function map(val, min, max) {
  return (val - min) / (max - min)
}

const color = new ColorTool()
let hex = color.hex(255, 0, 128)
const rgb = color.rgb(color.hex(255, 0, 128))
console.log(hex, rgb)

const w = 1200,
  h = 800

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

createTreemap(treeData, 'test.svg')

treeData.data.forEach((el) => {
  if (!el.org.publisher) console.log(el.label, el.org)
  if (el.org.orgPath) {
    console.log(el.label, el.org.orgPath)
    if (el.org.orgPath.startsWith('/STAT')) el.color = '#ff9999'
    else if (el.org.orgPath.startsWith('/KOMM')) el.color = '#9999FF'
    else el.color = '#999999'
  }
})

createTreemap(treeData, 'test2.svg')

parseMunicipalityMap('../data/2020_Norwegian_Municipalities_Map.svg')

orgs.forEach((o) => {
  if (o.orgPath.startsWith('/KOMM'))
    console.log(o.prefLabel, ',', o.datasets.length)
})
