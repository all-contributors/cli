import test from 'ava';
import nock from 'nock';
import getUserInfo from './github';

test.cb('should handle errors', t => {
  nock('https://api.github.com')
    .get('/users/nodisplayname')
    .replyWithError(404);

  getUserInfo('nodisplayname', err => {
    t.truthy(err);
    t.end();
  });
});

test.cb('should fill in the name when null is returned', t => {
  nock('https://api.github.com')
    .get('/users/nodisplayname')
    .reply(200, {
      login: 'nodisplayname',
      name: null,
      avatar_url: 'https://avatars2.githubusercontent.com/u/3869412?v=3&s=400',
      html_url: 'https://github.com/nodisplayname'
    });

  getUserInfo('nodisplayname', (err, info) => {
    t.falsy(err);
    t.is(info.name, 'nodisplayname');
    t.end();
  });
});

test.cb('should fill in the name when an empty string is returned', t => {
  nock('https://api.github.com')
    .get('/users/nodisplayname')
    .reply(200, {
      login: 'nodisplayname',
      name: '',
      avatar_url: 'https://avatars2.githubusercontent.com/u/3869412?v=3&s=400',
      html_url: 'https://github.com/nodisplayname'
    });

  getUserInfo('nodisplayname', (err, info) => {
    t.falsy(err);
    t.is(info.name, 'nodisplayname');
    t.end();
  });
});
