const fs = require('fs')

module.exports = function checkFile(file) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(file)) return resolve(file)
    fs.writeFile(file, '', err => {
      if (err) reject(err)
      resolve(file)
    })
  })
}
