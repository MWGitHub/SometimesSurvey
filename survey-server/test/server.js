const test = require('tape');
const Server = require('../lib/server');

test('test server start and stop', t => {
  t.plan(2);

  const server = new Server();
  server.start()
    .then(() => server.stop)
    .then(() => t.pass('server stop'))
    .catch(e => t.fail(e));

  t.pass('server start');
});
