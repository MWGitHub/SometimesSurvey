const test = require('tape');
const co = require('co');
const Server = require('../lib/server');

const path = require('../lib/api').path;
const EVENTS = require('../lib/handlers').EVENTS;

test('test authorization on private routes', t => {
  co(function* initialize() {
    const server = new Server();
    const instance = yield server.initialize();
    let res = yield instance.inject(`${path}/items`);
    t.equal(res.statusCode, 401, 'prevented access');

    res = yield instance.inject(`${path}/items/events/impression`);
    t.equal(res.statusCode, 200, 'allowed access');

    yield server.stop();

    t.end();
  }).catch(e => {
    t.fail(e);
  });
});

test('test all survey retrieval', t => {
  co(function* initialize() {
    const server = new Server({ key: 'test' });
    const instance = yield server.initialize();
    const res = yield instance.inject(`${path}/items?key=test`);

    t.equal(res.result.events.length, 1250, 'check for right count');
    t.equal(res.result.events[0].item_id, '0', 'check for right item');

    yield server.stop();

    t.end();
  }).catch(e => {
    t.fail(e);
  });
});

test('test pagination', t => {
  co(function* initialize() {
    const server = new Server({ key: 'test' });
    const instance = yield server.initialize();
    const res = yield instance.inject(
      `${path}/items?key=test&offset=250&limit=5`
    );

    t.equal(res.result.events.length, 5, 'check for right count');
    t.equal(res.result.events[0].item_id, '2', 'check for right item');

    yield server.stop();

    t.end();
  }).catch(e => {
    t.fail(e);
  });
});

test('test item result retrieval', t => {
  co(function* initialize() {
    const server = new Server({ key: 'test' });
    const instance = yield server.initialize();
    const res = yield instance.inject(`${path}/items/6?key=test`);

    t.equal(res.result.events.length, 125, 'check for right count');
    t.equal(res.result.events[0].item_id, '6', 'check for right item');

    yield server.stop();

    t.end();
  }).catch(e => {
    t.fail(e);
  });
});

test('test item events', t => {
  co(function* initialize() {
    const server = new Server({ key: 'test' });
    const instance = yield server.initialize();

    function makeEvent(event, data) {
      return instance.inject({
        method: 'POST',
        url: `${path}/items/100/events`,
        payload: {
          event,
          data,
        },
      });
    }

    function makeGet() {
      return instance.inject(`${path}/items/100?key=test`);
    }

    makeEvent(EVENTS.IMPRESSION);
    const res = makeGet();
    t.equal(res.result.events.length, 1, 'check for right count');
    t.equal(res.result.events[0].item_id, '100', 'check for right item');
    t.equal(res.result.events[0].event, EVENTS.IMPRESSION);

    yield server.stop();

    t.end();
  }).catch(e => {
    t.fail(e);
  });
});
