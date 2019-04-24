const labels = require('./labels.json')

const getDistinctCategories = () => {
  const cats = new Set()
  labels.forEach(d => cats.add(d.category))
  return Array.from(cats)
}

const CATEGORIES = getDistinctCategories().filter(Boolean)

module.exports = {
  getAll: () => [...labels],
  getAt: idx => labels[idx],
  getLabels: () => labels.map(d => d.label),
  getCategories: () => labels.map(d => d.category),
  getDistinctCategories: () => CATEGORIES,
  size: () => labels.length,
  getCategorisedLabels: () => labels.filter(l => !!l.category),
  getNullCatLabels: () => labels.filter(l => l.category == 'null'),
  getValidCatLabels: () => labels.filter(l => CATEGORIES.includes(l.category)),
  getBadData: () =>
    labels.filter(
      l => (!!l.category && !CATEGORIES.includes(l.category)) || !l.category,
    ),
}
