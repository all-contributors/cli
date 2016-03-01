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
    template: '<%= contributor.name %> is awesome!'
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
    '<!-- CONTRIBUTORS:START -->',
    '###Some content that will be replace###',
    '<!-- CONTRIBUTORS:END -->',
    '',
    'Thanks a lot guys!'
  ].join('\n');

  return {options, jfmengels, content};
}

test('should replace the content between the CONTRIBUTORS tags by  a table of contributors', t => {
  t.plan(1);

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
    '<!-- CONTRIBUTORS:START -->',
    '| Kent C. Dodds is awesome! | Divjot Singh is awesome! | Jeroen Engels is awesome! |',
    '| :---: | :---: | :---: |',
    '<!-- CONTRIBUTORS:END -->',
    '',
    'Thanks a lot guys!'
  ].join('\n');

  const result = generate(options, contributorList, content);

  t.is(result, expected);
});

test('should split contributors into multiples lines when there are too many', t => {
  t.plan(1);

  const {kentcdodds, bogas04} = contributors;
  const {options, jfmengels, content} = fixtures();
  const contributorList = [kentcdodds, kentcdodds, kentcdodds, kentcdodds, kentcdodds, kentcdodds, kentcdodds];
  const expected = [
    '# project',
    '',
    'Description',
    '',
    '## Contributors',
    'These people contributed to the project:',
    '<!-- CONTRIBUTORS:START -->',
    '| Kent C. Dodds is awesome! | Kent C. Dodds is awesome! | Kent C. Dodds is awesome! | Kent C. Dodds is awesome! | Kent C. Dodds is awesome! |',
    '| Kent C. Dodds is awesome! | Kent C. Dodds is awesome! |',
    '| :---: | :---: | :---: | :---: | :---: |',
    '<!-- CONTRIBUTORS:END -->',
    '',
    'Thanks a lot guys!'
  ].join('\n');

  const result = generate(options, contributorList, content);

  t.is(result, expected);
});
