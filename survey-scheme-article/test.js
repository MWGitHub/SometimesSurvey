const test = require('tape');

const seed = require('./seed');
const articles = seed.articles;
const deploy = seed.deploy;

const scheme = require('./index')(key => Promise.resolve(articles[key]));

test('it should always show', t => {
  t.plan(1);
  scheme.show('always', deploy).then(result => {
    if (result) {
      t.pass();
    } else {
      t.fail();
    }
  });
});
