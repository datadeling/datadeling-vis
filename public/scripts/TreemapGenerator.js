import fs from 'fs'
import { getTreemap } from 'treemap-squarify'
import { SVGNode, SVGUtil } from './SVGUtil.js'

export function createTreemap(treeData, filename, w, h) {
  console.log(`Generating simple treemap (${treeData.data.length} units)`)

  treeData.width = w
  treeData.height = h

  const treemap = getTreemap(treeData)
  treemap.width = w
  treemap.height = h

  const doc = treemapToSVG(treemap)
  fs.writeFileSync(filename, doc.str())

  console.log(`Exporting '${filename}'\n\n`)
}

// process data and generate treemap

function calcTreemap(treeData) {
  const treemap = getTreemap(treeData)

  // if treeData.x exists, we should add x,y as offset to the result
  if (treeData.x) {
    treemap.forEach((r) => {
      r.x += treeData.x
      r.y += treeData.y
    })
  }

  treemap.width = treeData.width
  treemap.height = treeData.height
  return treemap
}

export function createTreemapHierarchical(treeData, filename, w, h) {
  treeData.width = w
  treeData.height = h

  console.log(`Generating hierarchical treemap (${treeData.data.length} units)`)

  const topLevel = { width: w, height: h, data: [] }

  treeData.data.forEach((category) => {
    let sum = 0
    category.forEach((o) => (sum += o.value))
    topLevel.data.push({ value: sum, color: category[0].color, label: '' })
  })

  const treemap = calcTreemap(topLevel)

  const maps = []
  treeData.data.forEach((category) => {
    const box = treemap[maps.length]
    const level = {
      width: box.width,
      height: box.height,
      x: box.x,
      y: box.y,
      data: [],
    }

    category.forEach((o) => level.data.push(o))

    let map = calcTreemap(level)
    maps.push(map)
  })

  const totalMap = []
  maps.forEach((map) => {
    map.forEach((rect) => totalMap.push(rect))
  })

  totalMap.width = treeData.width
  totalMap.height = treeData.height
  fs.writeFileSync(filename, treemapToSVG(totalMap).str())
  console.log(`Exporting '${filename}'\n\n`)
}

function treemapToSVG(treemap) {
  const svg = new SVGUtil()

  const doc = svg.svgDoc(treemap.width, treemap.height)

  treemap.forEach((r) => {
    const rect = svg.svgGroup()
    rect.add(svg.svgRect(r.x, r.y, r.width, r.height, r.data.color, '#ffffff'))

    let fontsize = 4
    if (r.data.value > 3) {
      fontsize = Math.min(1, (r.data.value - 4) / 40) * 18 + 4

      let text = breakLine(r.data.label)
      let y = r.y + r.height / 2 - text.length * fontsize * 0.6 + fontsize

      text.forEach((t) => {
        rect.add(svg.svgText(r.x + fontsize, y, fontsize, '#000000', t))
        y += fontsize * 1.2
      })
    }
    rect.add(
      svg.svgText(
        r.x + 4,
        r.y + fontsize + 4,
        fontsize,
        '#000000',
        `[${r.data.value}]`,
      ),
    )

    doc.add(rect)

    // svg += ` <text style="font-size:${fontsize}px; color:#000000" x='${
    //   r.x + 4
    // }' y='${r.y + fontsize + 4}'>[${r.data.value}]</text>`
    // svg += '</g>\n'
  })

  return doc
}

// primitive attempt to break long texts into two lines
function breakLine(label) {
  let text = [label]
  let labelN = label.length
  let labelMid = Math.floor(labelN / 2)

  if (labelN > 12) {
    let bestSpace = 1000
    for (let i = 0; i < labelN; i++) {
      if (label.charAt(i) == ' ')
        bestSpace = Math.abs(labelMid - i) < bestSpace ? i : bestSpace
    }

    if (text[0].indexOf('direktor') > -1) {
      let pos = text[0].indexOf('direktor')
      text.push(text[0].substring(pos))
      text[0] = text[0].substring(0, pos) + '-'
    } else if (bestSpace < 1000) {
      text.push(text[0].substring(bestSpace + 1))
      text[0] = text[0].substring(0, bestSpace)
    }
  }
  return text
}
