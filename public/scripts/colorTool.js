export class ColorTool {
  constructor() {}

  valueToHex(c) {
    var hex = Math.floor(c).toString(16)
    if (hex.length < 2) hex = '0' + hex

    return hex
  }

  rgb(hex) {
    let rgbData = hex.match(/.{1,2}/g)
    let rgb = [
      parseInt(rgbData[0], 16),
      parseInt(rgbData[1], 16),
      parseInt(rgbData[2], 16),
    ]
    return rgb
  }

  hex(r, g, b) {
    return this.valueToHex(r) + this.valueToHex(g) + this.valueToHex(b)
  }

  lerp(hex1, hex2, t) {
    const rgb1 = this.rgb(hex1)
    const rgb2 = this.rgb(hex2)

    rgb1[0] = Math.floor((rgb2[0] - rgb1[0]) * t + rgb1[0])
    rgb1[1] = Math.floor((rgb2[1] - rgb1[1]) * t + rgb1[1])
    rgb1[2] = Math.floor((rgb2[2] - rgb1[2]) * t + rgb1[2])

    return this.hex(rgb1[0], rgb1[1], rgb1[2])
  }
}
