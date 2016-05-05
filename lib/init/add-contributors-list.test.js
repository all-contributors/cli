import test from 'ava';
import {addContributorsList} from './init-content';

test('should insert list under contributors section', t => {
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

  t.is(result, expected);
});

test('should create contributors section if it is absent', t => {
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
    '<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section --><!-- ALL-CONTRIBUTORS-LIST:END -->'
  ].join('\n');

  const result = addContributorsList(content);

  t.is(result, expected);
});

test('should create contributors section if content is empty', t => {
  const content = '';
  const expected = [
    '',
    '## Contributors',
    '',
    '<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section --><!-- ALL-CONTRIBUTORS-LIST:END -->'
  ].join('\n');

  const result = addContributorsList(content);

  t.is(result, expected);
});
