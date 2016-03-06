import test from 'ava';
import generate from './';
import contributors from './fixtures/contributors.json';

function getUserLine(content, {login}) {
  return content
    .split('\n')
    .filter(line => line.indexOf(login) !== -1)
    [0];
}

function fixtures() {
  const options = {
    projectOwner: 'kentcdodds',
    projectName: 'all-contributors',
    imageSize: 100,
    contributorsPerLine: 5,
    contributors: contributors,
    contributorTemplate: '<%= contributor.name %> is awesome!'
  };

  const jfmengels = {
    login: 'jfmengels',
    name: 'Jeroen Engels',
    html_url: 'https://github.com/jfmengels',
    avatar_url: 'https://avatars.githubusercontent.com/u/3869412?v=3',
    contributions: ['doc']
  };

  const content = [
    '# project',
    '',
    'Description',
    '',
    '## Contributors',
    'These people contributed to the project:',
    '<!-- ALL-CONTRIBUTORS-LIST:START -->',
    '###Some content that will be replaced###',
    '<!-- ALL-CONTRIBUTORS-LIST:END -->',
    '',
    'Thanks a lot guys!'
  ].join('\n');

  return {options, jfmengels, content};
}

test('should replace the content between the ALL-CONTRIBUTORS-LIST tags by a table of contributors', t => {
  const {kentcdodds, bogas04} = contributors;
  const {options, jfmengels, content} = fixtures();
  const contributorList = [kentcdodds, bogas04, jfmengels];
  const expected = [
    '# project',
    '',
    'Description',
    '',
    '## Contributors',
    'These people contributed to the project:',
    '<!-- ALL-CONTRIBUTORS-LIST:START -->',
    '| Kent C. Dodds is awesome! | Divjot Singh is awesome! | Jeroen Engels is awesome! |',
    '| :---: | :---: | :---: |',
    '<!-- ALL-CONTRIBUTORS-LIST:END -->',
    '',
    'Thanks a lot guys!'
  ].join('\n');

  const result = generate(options, contributorList, content);

  t.is(result, expected);
});

test('should split contributors into multiples lines when there are too many', t => {
  const {kentcdodds} = contributors;
  const {options, content} = fixtures();
  const contributorList = [kentcdodds, kentcdodds, kentcdodds, kentcdodds, kentcdodds, kentcdodds, kentcdodds];
  const expected = [
    '# project',
    '',
    'Description',
    '',
    '## Contributors',
    'These people contributed to the project:',
    '<!-- ALL-CONTRIBUTORS-LIST:START -->',
    '| Kent C. Dodds is awesome! | Kent C. Dodds is awesome! | Kent C. Dodds is awesome! | Kent C. Dodds is awesome! | Kent C. Dodds is awesome! |',
    '| :---: | :---: | :---: | :---: | :---: |',
    '| Kent C. Dodds is awesome! | Kent C. Dodds is awesome! |',
    '<!-- ALL-CONTRIBUTORS-LIST:END -->',
    '',
    'Thanks a lot guys!'
  ].join('\n');

  const result = generate(options, contributorList, content);

  t.is(result, expected);
});

test('should not inject anything if there is no tags to inject content in', t => {
  const {kentcdodds} = contributors;
  const {options} = fixtures();
  const contributorList = [kentcdodds];
  const content = [
    '# project',
    '',
    'Description',
    '',
    'License: MIT'
  ].join('\n');

  const result = generate(options, contributorList, content);
  t.is(result, content);
});

test('should not inject anything if start tag is malformed', t => {
  const {kentcdodds} = contributors;
  const {options} = fixtures();
  const contributorList = [kentcdodds];
  const content = [
    '# project',
    '',
    'Description',
    '<!-- ALL-CONTRIBUTORS-LIST:SSSSSSSTART -->',
    '<!-- ALL-CONTRIBUTORS-LIST:END -->',
    '',
    'License: MIT'
  ].join('\n');

  const result = generate(options, contributorList, content);
  t.is(result, content);
});

test('should not inject anything if end tag is malformed', t => {
  const {kentcdodds} = contributors;
  const {options} = fixtures();
  const contributorList = [kentcdodds];
  const content = [
    '# project',
    '',
    'Description',
    '<!-- ALL-CONTRIBUTORS-LIST:START -->',
    '<!-- ALL-CONTRIBUTORS-LIST:EEEEEEEND -->',
    '',
    'License: MIT'
  ].join('\n');

  const result = generate(options, contributorList, content);
  t.is(result, content);
});

test('should inject badge if the ALL-CONTRIBUTORS-BADGE tag is present', t => {
  const {kentcdodds} = contributors;
  const {options} = fixtures();
  const contributorList = [kentcdodds];
  const content = [
    '# project',
    '',
    'Badges',
    '<!-- ALL-CONTRIBUTORS-BADGE:START -->',
    '###Some content that will be replaced###',
    '<!-- ALL-CONTRIBUTORS-BADGE:END -->',
    '',
    'License: MIT'
  ].join('\n');
  const expected = [
    '# project',
    '',
    'Badges',
    '<!-- ALL-CONTRIBUTORS-BADGE:START -->',
    '[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors)',
    '<!-- ALL-CONTRIBUTORS-BADGE:END -->',
    '',
    'License: MIT'
  ].join('\n');

  const result = generate(options, contributorList, content);
  t.is(result, expected);
});
