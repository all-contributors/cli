import test from 'ava';
import {addBadge} from './initContent';

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
    '<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section --><!-- ALL-CONTRIBUTORS-BADGE:END -->',
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
    '<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section --><!-- ALL-CONTRIBUTORS-BADGE:END -->'
  ].join('\n');

  const result = addBadge(content);

  t.is(result, expected);
});
