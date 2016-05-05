import test from 'ava';
import {addBadge} from './init-content';

test('should insert badge under title', t => {
  const content = [
    '# project',
    '',
    'Description',
    '',
    'Foo bar'
  ].join('\n');
  const expected = [
    '# project',
    '[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors)',
    '',
    'Description',
    '',
    'Foo bar'
  ].join('\n');

  const result = addBadge(content);

  t.is(result, expected);
});

test('should add badge if content is empty', t => {
  const content = '';
  const expected = [
    '',
    '[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors)'
  ].join('\n');

  const result = addBadge(content);

  t.is(result, expected);
});
