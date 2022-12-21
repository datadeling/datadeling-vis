import fs from 'fs'
import { getTreemap } from 'treemap-squarify'

export function createTreemap(treeData, filename) {
  const treemap = getTreemap(treeData)

  let svg = `<svg width="${treeData.width}" height="${treeData.height}">\n`
  treemap.forEach((r) => {
    svg += `<g >\n`
    svg += ` <rect fill='${r.data.color}' stroke='#ffffff' x='${r.x}' y='${
      r.y + 6
    }' width='${r.width}' height='${r.height}' />\n`
    svg += ` <text style="font-size:12px; color:#000000" x='${r.x + 20}' y='${
      r.y + r.height / 2
    }'>${r.data.label}</text>\n`

    svg += ` <text style="font-size:9px; color:#000000" x='${r.x + 4}' y='${
      r.y + 13
    }'>[${r.data.value}]</text>`
    svg += '</g>\n'
  })
  svg += '</svg>\n'

  function svgRect(r) {}

  fs.writeFileSync(filename, svg)
}
