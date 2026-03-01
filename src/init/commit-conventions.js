const conventions = {
  angular: {
    name: 'Angular',
    msg: 'docs:',
    lowercase: true,
    transform(msg) {
      return msg.replace(
        /(^.*?) ([A-Z][a-z]+) \w*/,
        (_, ...words) => `${words[0]} ${words[1].toLowerCase()} `,
      )
    },
  },
  atom: {
    name: 'Atom',
    msg: ':memo:',
  },
  gitmoji: {
    name: 'Gitmoji',
    msg: ':busts_in_silhouette:',
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
    msg: '',
  },
}

Object.keys(conventions).forEach(style => {
  conventions[style].value = style
})

export {conventions}
