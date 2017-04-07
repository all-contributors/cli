import test from 'ava';
import _ from 'lodash/fp';
import formatContributor from './format-contributor';
import contributors from './fixtures/contributors.json';

function fixtures() {
  const options = {
    projectOwner: 'jfmengels',
    projectName: 'all-contributors-cli',
    imageSize: 150
  };
  return {options};
}

test('should format a simple contributor', t => {
  const contributor = _.assign(contributors.kentcdodds, {contributions: ['review']});
  const {options} = fixtures();

  const expected = '[<img src="https://avatars1.githubusercontent.com/u/1500684" width="150px;"/><br /><sub>Kent C. Dodds</sub>](http://kentcdodds.com)<br />👀';

  t.is(formatContributor(options, contributor), expected);
});

test('should format contributor with complex contribution types', t => {
  const contributor = contributors.kentcdodds;
  const {options} = fixtures();

  const expected = '[<img src="https://avatars1.githubusercontent.com/u/1500684" width="150px;"/><br /><sub>Kent C. Dodds</sub>](http://kentcdodds.com)<br />[📖](https://github.com/jfmengels/all-contributors-cli/commits?author=kentcdodds) 👀 💬';

  t.is(formatContributor(options, contributor), expected);
});

test('should format contributor using custom template', t => {
  const contributor = contributors.kentcdodds;
  const {options} = fixtures();
  options.contributorTemplate = '<%= contributor.name %> is awesome!';

  const expected = 'Kent C. Dodds is awesome!';

  t.is(formatContributor(options, contributor), expected);
});

test('should default image size to 100', t => {
  const contributor = _.assign(contributors.kentcdodds, {contributions: ['review']});
  const {options} = fixtures();
  delete options.imageSize;

  const expected = '[<img src="https://avatars1.githubusercontent.com/u/1500684" width="100px;"/><br /><sub>Kent C. Dodds</sub>](http://kentcdodds.com)<br />👀';

  t.is(formatContributor(options, contributor), expected);
});

test('should format contributor with pipes in their name', t => {
  const contributor = contributors.pipey;
  const {options} = fixtures();

  const expected = '[<img src="https://avatars1.githubusercontent.com/u/1500684" width="150px;"/><br /><sub>Who &#124; Needs &#124; Pipes?</sub>](http://github.com/chrisinajar)<br />[📖](https://github.com/jfmengels/all-contributors-cli/commits?author=pipey)';

  t.is(formatContributor(options, contributor), expected);
});
