import test from 'ava';
import _ from 'lodash/fp';
import formatContributor from './formatContributor';
import contributors from './fixtures/contributors.json';

function fixtures() {
  const options = {
    projectOwner: 'jfmengels',
    projectName: 'all-contributors-cli',
    imageSize: 100
  };
  return {options};
}

test('should format a simple contributor', t => {
  const contributor = _.assign(contributors.kentcdodds, {contributions: ['review']});
  const {options} = fixtures();

  const expected = '[![Kent C. Dodds](https://avatars1.githubusercontent.com/u/1500684?s=100)<br /><sub>Kent C. Dodds</sub>](http://kentcdodds.com)<br />👀';

  t.is(formatContributor(options, contributor), expected);
});

test('should format contributor with complex contribution types', t => {
  const contributor = contributors.kentcdodds;
  const {options} = fixtures();

  const expected = '[![Kent C. Dodds](https://avatars1.githubusercontent.com/u/1500684?s=100)<br /><sub>Kent C. Dodds</sub>](http://kentcdodds.com)<br />[📖](https://github.com/jfmengels/all-contributors-cli/commits?author=kentcdodds) 👀 ❓';

  t.is(formatContributor(options, contributor), expected);
});

test('should format contributor using custom template', t => {
  const contributor = contributors.kentcdodds;
  const {options} = fixtures();
  options.contributorTemplate = '<%= contributor.name %> is awesome!';

  const expected = 'Kent C. Dodds is awesome!';

  t.is(formatContributor(options, contributor), expected);
});

test('should add image size to url', t => {
  const {options} = fixtures();
  const contributor = contributors.kentcdodds;
  options.contributorTemplate = '<%= contributor.name %> at <%= contributor.avatar_url %>';

  var contributionWithoutQuestionMarkUrl = _.assign(contributor, {
    avatar_url: 'www.some-url-without-question-mark.com'
  });
  var contributionWithQuestionMarkUrl = _.assign(contributor, {
    avatar_url: 'www.some-url-with-question-mark.com?v=3'
  });

  t.is(formatContributor(options, contributionWithoutQuestionMarkUrl),
    'Kent C. Dodds at www.some-url-without-question-mark.com?s=100'
  );
  t.is(formatContributor(options, contributionWithQuestionMarkUrl),
    'Kent C. Dodds at www.some-url-with-question-mark.com?v=3&s=100'
  );
});
