const {parse} = require('jsonlint')

function captureError(err) {
  const errHeader = err.message.match(/^.*?(\d+):/)
  const errInfo = err.message.match(/Expecting .*? got \S+/)
  return {
    errHeader,
    errInfo,
    errMsg: `${errHeader[0]} ${errInfo}`,
  }
}

function doubleCheck(data) {
  /* eslint-disable no-console */
  try {
    const res = parse(data)
    console.log('The JSON data was fixed!')
    if (res) return data
  } catch (err) {
    console.error("There's still an error!")
    throw new Error(captureError(err).errMsg)
  }
  /* eslint-enable no-console */
}

function fixJson(err, data) {
  const {errHeader, errMsg} = captureError(err)
  const lnNum = errHeader[1] | 0 // eslint-disable-line no-bitwise
  console.error(errMsg) // eslint-disable-line no-console
  const lines = data.split('\n')
  const brokenLine = lines[lnNum - 1]
  //Removes the character and checks again
  let fixedLine = brokenLine.trimEnd()
  fixedLine = fixedLine.substr(0, fixedLine.length - 1)
  const fixedData = [...lines]
  fixedData[lnNum - 1] = fixedLine

  return doubleCheck(fixedData.join('\n'))
}

function checkJson(data) {
  //inspired by https://jsontuneup.com/
  try {
    const res = parse(data)
    if (res) {
      return res
    }
  } catch (err) {
    return fixJson(err, data)
  }
}

module.exports = checkJson
