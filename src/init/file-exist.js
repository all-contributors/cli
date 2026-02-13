import fs from 'fs'

export function ensureFileExists(file) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(file)) return resolve(file)
    fs.writeFile(file, '', err => {
      if (err) reject(err)
      resolve(file)
    })
  })
}
