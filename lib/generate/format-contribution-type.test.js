import test from 'ava';
import contributors from './fixtures/contributors.json';
import formatContributionType from './format-contribution-type';

const fixtures = () => {
  const options = {
    projectOwner: 'jfmengels',
    projectName: 'all-contributors-cli',
    imageSize: 100
  };
  return {options};
};

test('should return corresponding symbol', t => {
  const contributor = contributors.kentcdodds;
  const {options} = fixtures();

  t.is(formatContributionType(options, contributor, 'tool'), '[🔧](#tool-kentcdodds "Tools")');
  t.is(formatContributionType(options, contributor, 'question'), '[💬](#question-kentcdodds "Answering Questions")');
});

test('should return link to commits', t => {
  const contributor = contributors.kentcdodds;
  const {options} = fixtures();
  const expectedLink = 'https://github.com/jfmengels/all-contributors-cli/commits?author=kentcdodds';

  t.is(formatContributionType(options, contributor, 'code'), '[💻](' + expectedLink + ' "Code")');
  t.is(formatContributionType(options, contributor, 'doc'), '[📖](' + expectedLink + ' "Documentation")');
  t.is(formatContributionType(options, contributor, 'test'), '[⚠️](' + expectedLink + ' "Tests")');
});

test('should return link to issues', t => {
  const contributor = contributors.kentcdodds;
  const {options} = fixtures();
  const expected = '[🐛](https://github.com/jfmengels/all-contributors-cli/issues?q=author%3Akentcdodds "Bug reports")';

  t.is(formatContributionType(options, contributor, 'bug'), expected);
});

test('should make any symbol into a link if contribution is an object', t => {
  const contributor = contributors.kentcdodds;
  const {options} = fixtures();
  const contribution = {
    type: 'tool',
    url: 'www.foo.bar'
  };

  t.is(formatContributionType(options, contributor, contribution), '[🔧](www.foo.bar "Tools")');
});

test('should override url for given types', t => {
  const contributor = contributors.kentcdodds;
  const {options} = fixtures();
  const contribution = {
    type: 'code',
    url: 'www.foo.bar'
  };

  t.is(formatContributionType(options, contributor, contribution), '[💻](www.foo.bar "Code")');
});

test('should be able to add types to the symbol list', t => {
  const contributor = contributors.kentcdodds;
  const {options} = fixtures();
  options.types = {
    cheerful: {symbol: ':smiley:'}
  };

  t.is(formatContributionType(options, contributor, 'cheerful'), '[:smiley:](#cheerful-kentcdodds "")');
  t.is(formatContributionType(options, contributor, {
    type: 'cheerful',
    url: 'www.foo.bar'
  }), '[:smiley:](www.foo.bar "")');
});

test('should be able to add types with template to the symbol list', t => {
  const contributor = contributors.kentcdodds;
  const {options} = fixtures();
  options.types = {
    web: {
      symbol: ':web:',
      link: 'www.<%= contributor.login %>.com'
    }
  };

  t.is(formatContributionType(options, contributor, 'web'), '[:web:](www.kentcdodds.com "")');
});

test('should be able to override existing types', t => {
  const contributor = contributors.kentcdodds;
  const {options} = fixtures();
  options.types = {
    code: {symbol: ':smiley:'}
  };

  t.is(formatContributionType(options, contributor, 'code'), '[:smiley:](#code-kentcdodds "")');
  t.is(formatContributionType(options, contributor, {
    type: 'code',
    url: 'www.foo.bar'
  }), '[:smiley:](www.foo.bar "")');
});

test('should be able to override existing templates', t => {
  const contributor = contributors.kentcdodds;
  const {options} = fixtures();
  options.types = {
    code: {
      symbol: ':web:',
      link: 'www.<%= contributor.login %>.com'
    }
  };

  t.is(formatContributionType(options, contributor, 'code'), '[:web:](www.kentcdodds.com "")');
  t.is(formatContributionType(options, contributor, {
    type: 'code',
    url: 'www.foo.bar'
  }), '[:web:](www.foo.bar "")');
});

test('should throw a helpful error on unknown type', t => {
  const contributor = contributors.kentcdodds;
  const {options} = fixtures();
  t.throws(() => formatContributionType(options, contributor, 'docs'), 'Unknown contribution type docs for contributor kentcdodds');
});
