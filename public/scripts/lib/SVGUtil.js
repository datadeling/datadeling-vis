// Classes to represent SVG nodes with attributes and children nodes, along
// with some convenience functions to generate common node types.

export class SVGUtil {
  svgDoc(w, h) {
    return new SVGNode('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      'xmlns:xlink': 'http://www.w3.org/1999/xlink',
      width: w,
      height: h,
    })
  }

  svgGroup() {
    return new SVGNode('g', {})
  }

  svgText(x, y, fontsize, color, text) {
    const style = `font-size:${fontsize}px; color:${color}`
    return new SVGNode('text', { x: x, y: y, style: style }).add(text)
  }

  svgRect(x, y, w, h, fill, stroke) {
    const attr = { x: x, y: y, width: w, height: h }
    if (fill) attr.fill = fill
    if (stroke) attr.stroke = stroke

    const r = new SVGNode('rect', attr)

    return r
  }
}

export class SVGNode {
  // attr is an object of attributes to be added to the SVG element
  // 'rect', {x:0, y:0}) becomes <rect x="0" y="0"></rect>

  constructor(tag, attr) {
    this.children = []
    this.tag = tag
    this.attr = attr
  }

  add(child) {
    this.children.push(child)
    return this
  }

  // generate a string representing a valid SVG node
  str(index) {
    if (!index) index = 0

    let attrStr = ''
    let childStr = ''

    let attrKeys = Object.keys(this.attr)
    attrKeys.forEach((key) => {
      let val = this.attr[key]
      // if (typeof val === 'string') val = '"' + val + '"'
      attrStr += ` ${key}="${val}"`
    })

    let indent = ''
    for (let i = 0; i < index; i++) indent += '  '

    if (this.children.length > 0) {
      this.children.forEach((el) => {
        if (typeof el === 'string') childStr += indent + '  ' + el + '\n'
        else childStr += el.str(index + 1)
      })
    }

    let s = ''
    s += `${indent}<${this.tag}${attrStr}>\n${childStr}${indent}</${this.tag}>\n`

    return s
  }
}
