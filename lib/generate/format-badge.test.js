import test from 'ava';
import _ from 'lodash/fp';
import formatBadge from './format-badge';

test('should return badge with the number of contributors', t => {
  const options = {};
  const expected8 =
    '[![All Contributors](https://img.shields.io/badge/all_contributors-8-orange.svg?style=flat-square)](#contributors)';
  const expected16 =
    '[![All Contributors](https://img.shields.io/badge/all_contributors-16-orange.svg?style=flat-square)](#contributors)';

  t.is(formatBadge(options, _.times(_.constant({}), 8)), expected8);
  t.is(formatBadge(options, _.times(_.constant({}), 16)), expected16);
});

test('should be able to specify custom badge template', t => {
  const options = {
    badgeTemplate: 'We have <%= contributors.length %> contributors'
  };

  t.is(formatBadge(options, _.times(_.constant({}), 8)), 'We have 8 contributors');
  t.is(formatBadge(options, _.times(_.constant({}), 16)), 'We have 16 contributors');
});
