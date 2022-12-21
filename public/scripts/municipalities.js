import fs from 'fs'
import { getTreemap } from 'treemap-squarify'
import { parse } from 'svg-parser'

let LABEL = 'inkscape:label'

export function parseMunicipalityMap(filename) {
  const svg = parse(fs.readFileSync(filename, 'utf8'))

  console.log()
  listChildren(svg, '')
  fs.writeFileSync('test-svg-parser.json', JSON.stringify(svg))
}

function listChildren(node, prefix) {
  let str = prefix + node.type
  if (node.properties && node.properties[LABEL])
    str += '\t' + node.properties[LABEL]

  if (node.children) str += ` ${node.children.length} children`

  console.log(str)

  if (node.children) {
    node.children.forEach((el) => {
      listChildren(el, prefix + '  ')
    })
  }
}
