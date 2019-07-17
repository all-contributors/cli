const {existsSync} = require('fs')
const Learner = require('ac-learn')

const JSON_PATH = `${__dirname}/learner.json`

//@TODO: Use the JSON methods from `ac-learn` to get the whole thing saveable
const learner = new Learner()
/* eslint-disable no-console */
if (existsSync(JSON_PATH)) {
  learner.loadAndDeserializeClassifier(JSON_PATH).then(classifier => {
    learner.classifier = classifier
    // console.log('Re-using existing classifier')
  }, console.error)
} else {
  learner.crossValidate(6)
  learner.eval()
  learner.serializeAndSaveClassifier(JSON_PATH).then(_ => {
    // console.log('Classifier saved', classifier)
  }, console.error)
}
/* eslint-enable no-console */

module.exports = learner
