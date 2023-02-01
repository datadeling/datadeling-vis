import XLSX from 'xlsx'
import fs from 'fs'

let catalog = {}

// this XLSX file is not stored in the repo due to size constraints
// download current version from https://data.brreg.no/enhetsregisteret/oppslag/enheter
let filename = './offentligsektor2022-12-01-05.00.07.724.xlsx'

let data = fs.readFileSync(filename)
let workbook = XLSX.read(data)

let sheets = Object.keys(workbook.Sheets)
console.log(sheets)
sheets.forEach((sheet) => {
  parseSheet(workbook.Sheets[sheet])

  console.log(sheet, Object.keys(catalog).length, 'datasets')
})

console.log(catalog)

function parseSheet(sheet) {
  let json = XLSX.utils.sheet_to_json(sheet)

  let lvl = -1
  let parent = []
  let last

  let cnt = 0

  json.forEach((el) => {
    cnt++

    el.level = parseInt(el['Nivå'])
    el.Navn = el.Navn.trim()
    if (last) {
      if (el.level > last.level) {
        parent.push(last.Orgnr)
      } else if (el.level < last.level) {
        parent.pop()
      }
    }

    if (parent.length > 0) el.parent = parent[parent.length - 1]

    let prefix = ''
    for (let i = 0; i < el.level; i++) prefix += '  '
    let parentStr = ''
    if (el.parent)
      parentStr = 'parent ' + el.parent + ' - ' + catalog[el.parent].Navn
    // console.log(prefix, el.level, el.Orgnr, parentStr, parent)
    catalog[el.Orgnr] = el
    last = el
  })

  let keys = Object.keys(catalog)
  keys.sort()
  keys.forEach((el) => {
    if (catalog[el].parent) delete catalog[el].parent
    console.log(el)
  })
}

console.log('Write file ')
fs.writeFileSync('brreg_offentlig_sektor.json', JSON.stringify(catalog))
