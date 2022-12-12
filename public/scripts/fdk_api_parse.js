import fs from 'fs'

const filename = '../data/fdk_api_short.json'

let rawdata = fs.readFileSync(filename)
let data = JSON.parse(rawdata)

class ObjectSet {
  constructor() {
    this.items = []
  }

  get(id) {
    let result

    this.items.forEach((el) => {
      if (el.id === id) result = el
    })

    if (result) result.getCnt++
    return result
  }

  add(item) {
    item.getCnt = 0
    this.items.push(item)
  }

  forEach(callback) {
    this.items.forEach((el) => callback(el))
  }

  size() {
    return this.items.length
  }

  sort(func) {
    this.items = this.items.sort(func)
  }
}

const datasets = new ObjectSet()
const orgs = new ObjectSet()
const keywords = new ObjectSet()
const errors = []

function checkSet(id, set) {
  let found
  set.forEach((el) => {
    if (el.id === id) {
      found = el
      return found
    }
  })

  return found
}

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

console.log('id;name;datasets')
orgs.forEach((o) => {
  console.log(`${o.id};${o.prefLabel};${o.datasets.length}`)
})

orgs.items.sort((a, b) => {
  return b.datasets.length - a.datasets.length
})

keywords.items.sort((a, b) => {
  return b.datasets.length - a.datasets.length
})

let word = keywords.get('energi')
word.datasets.forEach((el) => {
  console.log(el.publisher.prefLabel.nb)
})

console.log('--------------------------\n', '\n\n')
console.log('keyword;datasets')
let w = []
keywords.forEach((word) => w.push(word.id))
w.forEach((word) => {
  let item = keywords.get(word)
  console.log(`${word};${item.datasets.length}`)
})
