import prettier from 'prettier'

export async function formatConfig(configPath, content) {
  const stringified = JSON.stringify(content, null, 2)

  try {
    const prettierConfig = await prettier.resolveConfig(configPath, {
      useCache: false,
    })

    if (!prettierConfig) return stringified

    const formattedOutput = await prettier.format(stringified, {
      ...prettierConfig,
      parser: 'json',
    })

    return formattedOutput.trimEnd()
  } catch {
    // If Prettier can't be required or throws in general,
    // assume it's not usable and we should fall back to JSON.stringify
    return stringified
  }
}
