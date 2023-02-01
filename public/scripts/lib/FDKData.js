import fs from 'fs'
import { ObjectSet } from './ObjectSet.js'

const DEBUG = false

// parsed data structures
const datasets = new ObjectSet()
const orgs = new ObjectSet()
const keywords = new ObjectSet()
const errors = []

//////////////////////////
//// Parse FDK dataset

export function parseFDK(filename) {
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

  let maxDatasets = 0
  let minDatasets = 10000

  orgs.forEach((o) => {
    minDatasets =
      o.datasets.length < minDatasets ? o.datasets.length : minDatasets
    maxDatasets =
      o.datasets.length > maxDatasets ? o.datasets.length : maxDatasets
  })

  return {
    datasets: datasets,
    orgs: orgs,
    keywords: keywords,
    minDatasets: minDatasets,
    maxDatasets: maxDatasets,
  }
}
