// const ctrbType = require('../util/contributions-types');

const CATEGORIES = ['blog', 'bug', 'business', 'code', 'content', 'design', 'doc', 'eventOrganizing', 'example', 'financial', 'fundingFinding', 'ideas', 'infra', 'maintenance', 'platform', 'plugin', 'projectManagement', 'question', 'review', 'security', 'talk', 'test', 'tool', 'translation', 'tutorial', 'userTesting', 'video'];//Object.keys(ctrbType('github'));
/*
['blog', 'bug', 'business', 'code', 'content', 'design', 'doc', 'eventOrganizing', 'example', 'financial', 'fundingFinding', 'ideas', 'infra', 'maintenance', 'platform', 'plugin', 'projectManagement', 'question', 'review', 'security', 'talk', 'test', 'tool', 'translation', 'tutorial', 'userTesting', 'video']
*/

const labelPrefixes = [
  'type:',
  'cat:',
  'type-',
  'cat-',
];

const RE = /(type|cat|category)?\s*[:-]?\s*(\w+)/gi;

module.exports = function classifyLabel(label) {
  const match = RE.exec(label);
  console.log('match=', match);
  if (match === null) throw new Error(`The label ${label} couldn't be classified`);
  const extractedLabel = match[match.length - 1];
  if (CATEGORIES.includes(extractedLabel)) return extractedLabel;
  else {
    switch (extractedLabel) {
      case 'graphic':
      case 'ui':
      case 'ux':
        return 'design'
      case 'dev':
      case 'front-end':
      case 'back-end':
      case 'feature':
        return 'code'
      case 'event':
        return 'eventOrganizing'
      case 'finance':
        return 'financial'
      case 'funding':
        return 'fundingFinding'
      case 'add-on':
        return 'plugin'
      case 'testing':
        return 'test'
      default:
        throw new Error(`The label ${extractedLabel} couldn't be associated to a category from https://allcontributors.org/docs/en/emoji-key`);
    }
  }
}