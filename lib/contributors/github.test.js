import test from 'ava';
import nock from 'nock';
import getUserInfo from './github';

test('should handle errors', t => {
  nock('https://api.github.com')
    .get('/users/nodisplayname')
    .replyWithError(404);

  return t.throws(getUserInfo('nodisplayname'));
});

test('should fill in the name when null is returned', t => {
  nock('https://api.github.com')
    .get('/users/nodisplayname')
    .reply(200, {
      login: 'nodisplayname',
      name: null,
      avatar_url: 'https://avatars2.githubusercontent.com/u/3869412?v=3&s=400',
      html_url: 'https://github.com/nodisplayname'
    });

  return getUserInfo('nodisplayname')
  .then(info => {
    t.is(info.name, 'nodisplayname');
  });
});

test('should fill in the name when an empty string is returned', t => {
  nock('https://api.github.com')
    .get('/users/nodisplayname')
    .reply(200, {
      login: 'nodisplayname',
      name: '',
      avatar_url: 'https://avatars2.githubusercontent.com/u/3869412?v=3&s=400',
      html_url: 'https://github.com/nodisplayname'
    });

  return getUserInfo('nodisplayname')
  .then(info => {
    t.is(info.name, 'nodisplayname');
  });
});

test('should append http when no absolute link is provided', t => {
  nock('https://api.github.com')
    .get('/users/nodisplayname')
    .reply(200, {
      login: 'nodisplayname',
      name: '',
      avatar_url: 'https://avatars2.githubusercontent.com/u/3869412?v=3&s=400',
      html_url: 'www.github.com/nodisplayname'
    });

  return getUserInfo('nodisplayname')
  .then(info => {
    t.is(info.profile, 'http://www.github.com/nodisplayname');
  });
});
