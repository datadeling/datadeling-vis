// Simple class to index sets of objects with an 'id' field - i.e. {id:'SOME_ID'}
// Used in FDKData to build a catalog of unique entities and populate them with a list
// of datasets they publish.

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
