const test = require('tape');
const Server = require('../lib/server');

test('test server start and stop', t => {
  t.plan(2);

  const server = new Server();
  server.start();

  t.pass('server start');

  server.stop().then(() => {
    t.pass('server stop');
  });
});
