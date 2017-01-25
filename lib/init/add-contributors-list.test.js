import test from 'ava';
import {addContributorsList, setContentLanguage} from './init-content';

test('should insert list under contributors section', t => {
  const content = [
    '# project',
    '',
    'Description',
    '',
    '## Contributors<div id=\'contributors\'></div>',
    ''
  ].join('\n');
  const expected = [
    '# project',
    '',
    'Description',
    '',
    '## Contributors<div id=\'contributors\'></div>',
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
    '## Contributors<div id=\'contributors\'></div>',
    '',
    'Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):',
    '',
    '<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section --><!-- ALL-CONTRIBUTORS-LIST:END -->',
    '',
    'This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!'
  ].join('\n');

  const result = addContributorsList(content);
  t.is(result, expected);
});

test('should create contributors section if content is empty', t => {
  const content = '';
  const expected = [
    '',
    '## Contributors<div id=\'contributors\'></div>',
    '',
    'Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):',
    '',
    '<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section --><!-- ALL-CONTRIBUTORS-LIST:END -->',
    '',
    'This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!'
  ].join('\n');

  const result = addContributorsList(content);
  t.is(result, expected);
});

test('should insert list under contributors section in Spanish', t => {
  const content = [
    '# project',
    '',
    'Description',
    '',
    '## Colaboradores<div id=\'contributors\'></div>',
    ''
  ].join('\n');
  const expected = [
    '# project',
    '',
    'Description',
    '',
    '## Colaboradores<div id=\'contributors\'></div>',
    '',
    '<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section --><!-- ALL-CONTRIBUTORS-LIST:END -->'
  ].join('\n');
  setContentLanguage('ES');
  const result = addContributorsList(content);
  t.is(result, expected);
});

test('should create contributors section if it is absent in Spanish', t => {
  const content = [
    '# project',
    '',
    'Description'
  ].join('\n');
  const expected = [
    '# project',
    '',
    'Description',
    '## Colaboradores<div id=\'contributors\'></div>',
    '',
    'Los agradecimientos a estas geniales personas: ([Simbología de Emojis](https://github.com/kentcdodds/all-contributors#emoji-key)):',
    '',
    '<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section --><!-- ALL-CONTRIBUTORS-LIST:END -->',
    '',
    'Este proyecto se adhiere a la especicifación de [all-contributors](https://github.com/kentcdodds/all-contributors). Las contribuciones de todo tipo son bienvenidas!'
  ].join('\n');
  setContentLanguage('ES');
  const result = addContributorsList(content);
  t.is(result, expected);
});

test('should create contributors section if content is empty in Spanish', t => {
  const content = '';
  const expected = [
    '',
    '## Colaboradores<div id=\'contributors\'></div>',
    '',
    'Los agradecimientos a estas geniales personas: ([Simbología de Emojis](https://github.com/kentcdodds/all-contributors#emoji-key)):',
    '',
    '<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section --><!-- ALL-CONTRIBUTORS-LIST:END -->',
    '',
    'Este proyecto se adhiere a la especicifación de [all-contributors](https://github.com/kentcdodds/all-contributors). Las contribuciones de todo tipo son bienvenidas!'
  ].join('\n');
  setContentLanguage('ES');
  const result = addContributorsList(content);
  t.is(result, expected);
});
