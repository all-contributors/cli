import labels from '../labels'
import categories from '../categories'

const LEN = 395

test('All data', () => {
  const data = labels.getAll()
  expect(data.length).toStrictEqual(LEN)
  expect(Array.isArray(data)).toBeTruthy()
  expect(data[9]).toEqual({label: ':bug: bug', category: 'bug'})
})

test('get', () => {
  expect(labels.getAt(0)).toEqual({label: '0 - backlog', category: 'null'})
  expect(labels.getAt(9)).toEqual({label: ':bug: bug', category: 'bug'})
})

test('Labels', () => {
  const lbls = labels.getLabels()
  expect(lbls.length).toStrictEqual(LEN)
  expect(Array.isArray(lbls)).toBeTruthy()
  expect(lbls[9]).toEqual(':bug: bug')
})

test('Categories', () => {
  const cats = labels.getCategories()
  expect(cats.length).toStrictEqual(LEN)
  expect(Array.isArray(cats)).toBeTruthy()
  expect(cats[9]).toEqual('bug')
})

test('Distinct cats', () => {
  const dc = labels.getDistinctCategories()
  expect(dc.includes('null')).toBeTruthy()
})

test('Size', () => {
  expect(labels.size()).toStrictEqual(LEN)
})

test('Labels with categories', () => {
  const cl = labels.getCategorisedLabels()
  expect(cl.length > categories.length).toBeTruthy()
  expect(cl[9]).toEqual({label: ':bug: bug', category: 'bug'})
})

test('Labels with a `null` category', () => {
  const nl = labels.getNullCatLabels()
  expect(nl.length < LEN - categories.length).toBeTruthy()
  expect(nl[0]).toEqual({label: '0 - backlog', category: 'null'})
})

test('Labels with a valid category', () => {
  const vl = labels.getValidCatLabels()
  expect(vl.length > categories.length).toBeTruthy()
  expect(vl[0]).toEqual({label: '0 - backlog', category: 'null'})
})

test('Bad data', () => {
  expect(labels.getBadData()).toEqual([])
})
