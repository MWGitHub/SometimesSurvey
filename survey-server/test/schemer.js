const test = require('tape');
const schemer = require('../lib/schemer');

const badScheme = {};

const yesScheme = {
  show() {
    return true;
  },
};

const noScheme = {
  show() {
    return false;
  },
};

test('test scheme validity', t => {
  t.ok(schemer.validScheme(yesScheme), 'valid');
  t.notOk(schemer.validScheme(badScheme), 'invalid');

  t.end();
});

test('test scheme status', t => {
  t.ok(schemer.checkStatus(null, yesScheme), 'always true');
  t.notOk(schemer.checkStatus(null, noScheme), 'always false');

  t.end();
});
