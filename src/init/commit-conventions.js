const conventions = {
  angular: {
    name: 'Angular',
    msg: 'docs:',
    lowercase: true,
  },
  atom: {
    name: 'Atom',
    msg: ':memo:',
  },
  ember: {
    name: 'Ember',
    msg: '[DOC canary]',
  },
  eslint: {
    name: 'ESLint',
    msg: 'Docs:',
  },
  jshint: {
    name: 'JSHint',
    msg: '[[DOCS]]',
  },
  none: {
    name: 'None',
    msg: 'Docs:',
  },
}

Object.keys(conventions).forEach(style => {
  conventions[style].value = style
})

module.exports = conventions
