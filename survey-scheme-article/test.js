const test = require('tape');
const co = require('co');

const seed = require('./seed');
const articles = seed.articles;
const deploy = seed.deploy;

const scheme = require('./index').scheme(key => Promise.resolve(articles[key]));

test('it should always show', t => {
  t.plan(1);
  scheme.show('always', deploy).then(result => {
    if (result) {
      t.pass();
    } else {
      t.fail();
    }
    t.end();
  }).catch(e => t.fail(e));
});

test('it should not show', t => {
  co(function* noShows() {
    let result = yield scheme.show('publishedBefore', deploy);
    t.notOk(result, 'published before deploy');

    result = yield scheme.show('old', deploy);
    t.notOk(result, 'too old');

    result = yield scheme.show('unpopular', deploy);
    t.notOk(result, 'too unpopular');

    result = yield scheme.show('unpopularHot', deploy);
    t.notOk(result, 'too unpopular and hot');

    result = yield scheme.show('full', deploy);
    t.notOk(result, 'too full');

    let count = 0;
    for (let i = 0; i < 10000; ++i) {
      result = yield scheme.show('catdilocks', deploy);
      if (result) count++;
    }
    t.ok(count > 800 && count < 1200, 'chance test clear');

    t.end();
  }).catch(e => t.fail(e));
});
