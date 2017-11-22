import {addContributorsList} from './init-content';

test('should insert list under contributors section', () => {
  const content = [
    '# project',
    '',
    'Description',
    '',
    '## Contributors',
    ''
  ].join('\n');
  const expected = [
    '# project',
    '',
    'Description',
    '',
    '## Contributors',
    '',
    '<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section --><!-- ALL-CONTRIBUTORS-LIST:END -->'
  ].join('\n');

  const result = addContributorsList(content);

  expect(result).toBe(expected);
});

test('should create contributors section if it is absent', () => {
  const content = [
    '# project',
    '',
    'Description'
  ].join('\n');
  const expected = [
    '# project',
    '',
    'Description',
    '## Contributors',
    '',
    'Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):',
    '',
    '<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section --><!-- ALL-CONTRIBUTORS-LIST:END -->',
    '',
    'This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!'
  ].join('\n');

  const result = addContributorsList(content);

  expect(result).toBe(expected);
});

test('should create contributors section if content is empty', () => {
  const content = '';
  const expected = [
    '',
    '## Contributors',
    '',
    'Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):',
    '',
    '<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section --><!-- ALL-CONTRIBUTORS-LIST:END -->',
    '',
    'This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!'
  ].join('\n');

  const result = addContributorsList(content);

  expect(result).toBe(expected);
});
