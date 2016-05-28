const test = require('tape');
const co = require('co');
const Server = require('../lib/server');

const path = require('../lib/api').path;
const EVENTS = require('../lib/handlers').EVENTS;

test('test authentication on private routes', t => {
  const server = new Server({ key: 'test' });

  co(function* initialize() {
    const instance = yield server.initialize();
    let res = yield instance.inject(`${path}/items`);
    t.equal(res.statusCode, 401, 'prevented access');

    res = yield instance.inject(`${path}/items?key=test`);
    t.equal(res.statusCode, 200, 'allowed access');

    yield server.stop();

    t.end();
  }).catch(e => {
    server.stop();
    t.fail(e);
  });
});

test('test all survey retrieval', t => {
  const server = new Server({ key: 'test' });

  co(function* initialize() {
    const instance = yield server.initialize();
    const res = yield instance.inject(`${path}/items?key=test`);

    t.equal(res.result.events.length, 1250, 'check for right count');
    t.equal(res.result.events[0].item_key, '0', 'check for right item');

    yield server.stop();

    t.end();
  }).catch(e => {
    server.stop();
    t.fail(e);
  });
});

test('test pagination', t => {
  const server = new Server({ key: 'test' });

  co(function* initialize() {
    const instance = yield server.initialize();
    const res = yield instance.inject(
      `${path}/items?key=test&offset=250&limit=5`
    );

    t.equal(res.result.events.length, 5, 'check for right count');
    t.equal(res.result.events[0].item_key, '2', 'check for right item');

    yield server.stop();

    t.end();
  }).catch(e => {
    server.stop();
    t.fail(e);
  });
});

test('test item result retrieval', t => {
  const server = new Server({ key: 'test' });

  co(function* initialize() {
    const instance = yield server.initialize();
    const res = yield instance.inject(`${path}/items/6?key=test`);

    t.equal(res.result.events.length, 125, 'check for right count');
    t.equal(res.result.events[0].item_key, '6', 'check for right item');

    yield server.stop();

    t.end();
  }).catch(e => {
    server.stop();
    t.fail(e);
  });
});

test('test item status', t => {
  const server = new Server({ key: 'test' });

  co(function* initialize() {
    const instance = yield server.initialize();
    const res = yield instance.inject(`${path}/items/6/status`);

    t.equal(res.statusCode, 200);
    t.equal(res.result.show, true);

    yield server.stop();

    t.end();
  }).catch(e => {
    server.stop();
    t.fail(e);
  });
});

test('test item events', t => {
  const server = new Server({ key: 'test' });

  co(function* initialize() {
    const instance = yield server.initialize();

    function makeEvent(event, data) {
      const payload = { event };
      if (data) {
        payload.data = data;
      }
      return instance.inject({
        method: 'POST',
        url: `${path}/items/100/events`,
        payload,
      });
    }

    function makeGet() {
      return instance.inject(`${path}/items/100?key=test`);
    }

    let res = yield makeEvent(EVENTS.IMPRESSION);
    t.equal(res.statusCode, 200);

    res = makeGet();
    t.equal(res.result.events.length, 1, 'check for right count');
    t.equal(res.result.events[0].item_key, '100', 'check for right item');
    t.equal(res.result.events[0].event, EVENTS.IMPRESSION);

    yield server.stop();

    t.end();
  }).catch(e => {
    server.stop();
    t.fail(e);
  });
});
