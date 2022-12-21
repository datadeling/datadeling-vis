export class ObjectSet {
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
