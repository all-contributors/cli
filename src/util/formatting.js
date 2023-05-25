function formatConfig(configPath, content) {
  const stringified = JSON.stringify(content, null, 2)
  try {
    const prettier = require('prettier')
    const prettierConfig = prettier.resolveConfig.sync(configPath, {
      useCache: false,
    })

    return prettierConfig
      ? prettier.format(stringified, {...prettierConfig, parser: 'json'})
      : stringified
  } catch (error) {
    // If Prettier can't be required or throws in general,
    // assume it's not usable and we should fall back to JSON.stringify
    return stringified
  }
}

module.exports = {
  formatConfig,
}
