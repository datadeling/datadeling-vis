import XLSX from 'xlsx'
import fs from 'fs'

let catalog = {}

let filename = './offentligsektor2022-12-01-05.00.07.724.xlsx'

let data = fs.readFileSync(filename)
let workbook = XLSX.read(data)

let sheets = Object.keys(workbook.Sheets)
let o = XLSX.utils.sheet_to_json(workbook.Sheets[sheets[0]])
parseSheet(workbook.Sheets[sheets[0]])

function parseSheet(sheet) {
  let json = XLSX.utils.sheet_to_json(sheet)

  let lvl = -1
  let parent = []
  let last

  json.forEach((el) => {
    el.level = parseInt(el['Nivå'])
    if (last) {
      if (el.level > last.level) {
        parent.push(last.Orgnr)
      } else if (el.level < last.level) {
        console.log(parent)
        parent.pop()
        console.log('pop', parent)
      }
    }

    if (parent.length > 0) el.parent = parent[parent.length - 1]

    let prefix = ''
    for (let i = 0; i < el.level; i++) prefix += '  '
    console.log(prefix, el.level, el.Orgnr, 'parent ' + el.parent, parent)
    last = el
  })
}
