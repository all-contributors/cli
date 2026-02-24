import {Eta} from 'eta'

const eta = new Eta({
  useWith: true,
  autoEscape: false,
})

export const template = templateString => data =>
  eta.renderString(templateString, data)
