import test from 'ava';
import addContributor from './add';

function mockInfoFetcher(username) {
  return Promise.resolve({
    login: username,
    name: 'Some name',
    avatar_url: 'www.avatar.url',
    profile: 'www.profile.url'
  });
}

function fixtures() {
  const options = {
    contributors: [{
      login: 'login1',
      name: 'Some name',
      avatar_url: 'www.avatar.url',
      profile: 'www.profile.url',
      contributions: [
        'code'
      ]
    }, {
      login: 'login2',
      name: 'Some name',
      avatar_url: 'www.avatar.url',
      profile: 'www.profile.url',
      contributions: [
        {type: 'blog', url: 'www.blog.url/path'},
        'code'
      ]
    }]
  };
  return {options};
}

test('should callback with error if infoFetcher fails', t => {
  const {options} = fixtures();
  const username = 'login3';
  const contributions = ['doc'];
  function infoFetcher() {
    return Promise.reject(new Error('infoFetcher error'));
  }

  return t.throws(
    addContributor(options, username, contributions, infoFetcher),
    'infoFetcher error'
  );
});

test('should add new contributor at the end of the list of contributors', t => {
  const {options} = fixtures();
  const username = 'login3';
  const contributions = ['doc'];

  return addContributor(options, username, contributions, mockInfoFetcher)
  .then(contributors => {
    t.is(contributors.length, 3);
    t.deepEqual(contributors[2], {
      login: 'login3',
      name: 'Some name',
      avatar_url: 'www.avatar.url',
      profile: 'www.profile.url',
      contributions: [
        'doc'
      ]
    });
  });
});

test('should add new contributor at the end of the list of contributors with a url link', t => {
  const {options} = fixtures();
  const username = 'login3';
  const contributions = ['doc'];
  options.url = 'www.foo.bar';

  return addContributor(options, username, contributions, mockInfoFetcher)
  .then(contributors => {
    t.is(contributors.length, 3);
    t.deepEqual(contributors[2], {
      login: 'login3',
      name: 'Some name',
      avatar_url: 'www.avatar.url',
      profile: 'www.profile.url',
      contributions: [
        {type: 'doc', url: 'www.foo.bar'}
      ]
    });
  });
});

test(`should not update an existing contributor's contributions where nothing has changed`, t => {
  const {options} = fixtures();
  const username = 'login2';
  const contributions = ['blog', 'code'];

  return addContributor(options, username, contributions, mockInfoFetcher)
  .then(contributors => {
    t.deepEqual(contributors, options.contributors);
  });
});

test(`should update an existing contributor's contributions if a new type is added`, t => {
  const {options} = fixtures();
  const username = 'login1';
  const contributions = ['bug'];
  return addContributor(options, username, contributions, mockInfoFetcher)
  .then(contributors => {
    t.is(contributors.length, 2);
    t.deepEqual(contributors[0], {
      login: 'login1',
      name: 'Some name',
      avatar_url: 'www.avatar.url',
      profile: 'www.profile.url',
      contributions: [
        'code',
        'bug'
      ]
    });
  });
});

test(`should update an existing contributor's contributions if a new type is added with a link`, t => {
  const {options} = fixtures();
  const username = 'login1';
  const contributions = ['bug'];
  options.url = 'www.foo.bar';

  return addContributor(options, username, contributions, mockInfoFetcher)
  .then(contributors => {
    t.is(contributors.length, 2);
    t.deepEqual(contributors[0], {
      login: 'login1',
      name: 'Some name',
      avatar_url: 'www.avatar.url',
      profile: 'www.profile.url',
      contributions: [
        'code',
        {type: 'bug', url: 'www.foo.bar'}
      ]
    });
  });
});
