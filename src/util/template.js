const {Eta} = require('eta')

const eta = new Eta({
  useWith: true,
  autoEscape: false,
})
const template = templateString => data =>
  eta.renderString(templateString, data)

module.exports = template
