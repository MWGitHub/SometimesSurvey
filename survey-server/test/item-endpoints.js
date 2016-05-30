const test = require('tape');
const co = require('co');
const Server = require('../lib/server');
const database = require('../lib/database');

const path = require('../lib/api').path;
const EVENTS = require('../lib/events').EVENTS;
const surveyID = 1;

test('test authentication on private routes', t => {
  const server = new Server({ key: 'test' });

  co(function* initialize() {
    const instance = yield server.initialize();
    let res = yield instance.inject(`${path}/surveys/${surveyID}/items`);
    t.equal(res.statusCode, 401, 'prevented access');

    res = yield instance.inject(`${path}/surveys/${surveyID}/items?key=test`);
    t.equal(res.statusCode, 200, 'allowed access');

    yield server.stop();

    t.end();
  }).catch(e => {
    server.stop();
    t.fail(e);
  });
});

test('test all events retrieval', t => {
  const server = new Server({ key: 'test' });

  co(function* initialize() {
    const instance = yield server.initialize();
    const res = yield instance.inject(`${path}/surveys/${surveyID}/items?key=test`);

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
      `${path}/surveys/${surveyID}/items?key=test&offset=250&limit=5`
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
    const res = yield instance.inject(`${path}/surveys/${surveyID}/items/6?key=test`);

    t.equal(res.result.events.length, 125, 'check for right count');
    t.equal(res.result.events[0].item_key, '6', 'check for right item');

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
    const res = yield instance.inject(`${path}/surveys/${surveyID}/items/4/stats?key=test`);

    t.equal(res.result.rating, 5.5);

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
    const res = yield instance.inject(`${path}/surveys/${surveyID}/items/6/status`);

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
    const instance = yield server.start();

    function makeEvent(event, data, cookie) {
      const request = {
        method: 'POST',
        url: `${path}/surveys/${surveyID}/items/100/events`,
        payload: {
          event,
        },
      };
      if (data) {
        request.payload.data = data;
      }
      if (cookie) {
        const main = cookie.split(';')[0];
        request.headers = {
          cookie: main,
        };
      }
      return instance.inject(request);
    }

    function makeGet() {
      return instance.inject(`${path}/surveys/${surveyID}/items/100?key=test`);
    }

    let res = yield makeEvent(EVENTS.IMPRESSION);
    const cookie = res.headers['set-cookie'][0];
    t.equal(res.statusCode, 200);

    res = yield makeEvent(EVENTS.IMPRESSION, null, cookie);
    t.equal(res.statusCode, 400, 'second impression should fail');

    res = yield makeGet();
    t.equal(res.result.events.length, 1, 'check for right count');
    t.equal(res.result.events[0].item_key, '100', 'check for right item');
    t.equal(res.result.events[0].event, EVENTS.IMPRESSION);

    res = yield makeEvent(EVENTS.CONVERSION, null);
    t.equal(res.statusCode, 400, 'events without a cookie should reject');

    // Test with valid conversion
    res = yield makeEvent(EVENTS.CONVERSION, {
      box: 5,
    }, cookie);
    t.equal(res.statusCode, 200);
    res = yield makeGet();
    t.equal(res.result.events.length, 2, 'check for right count');
    t.equal(res.result.events[0].event, EVENTS.CONVERSION);

    // Test with invalid conversion
    res = yield makeEvent(EVENTS.CONVERSION, {}, cookie);
    t.equal(res.statusCode, 400);
    res = yield makeEvent(EVENTS.CONVERSION, { box: 5 });
    t.equal(res.statusCode, 400);

    res = yield makeGet();
    t.equal(res.result.events.length, 2, 'check for right count');
    t.equal(res.result.events[0].event, EVENTS.CONVERSION);

    // Test with capture
    res = yield makeEvent(EVENTS.CAPTURE, {
      name: 'readerSurvey',
    }, cookie);
    t.equal(res.statusCode, 200);
    res = yield makeGet();
    t.equal(res.result.events.length, 3, 'check for right count');
    t.equal(res.result.events[0].event, EVENTS.CAPTURE);

    res = yield makeEvent(EVENTS.CAPTURE, {
      name: 'readerSurvey',
      'after.survey': true,
    }, cookie);
    t.equal(res.statusCode, 200);
    res = yield makeGet();
    t.equal(res.result.events.length, 4, 'check for right count');
    t.equal(res.result.events[0].event, EVENTS.CAPTURE);

    // Invalid capture
    res = yield makeEvent(EVENTS.CAPTURE, {}, cookie);
    t.equal(res.statusCode, 400);
    res = yield makeEvent(EVENTS.CAPTURE, { 'after.survey': true }, cookie);
    t.equal(res.statusCode, 400);
    res = yield makeEvent(EVENTS.CAPTURE, {
      name: 'reader',
      'after.survey': true,
    }, cookie);
    t.equal(res.statusCode, 400);
    res = yield makeEvent(EVENTS.CAPTURE, {
      name: 'readerSurvey',
      'after.survey': false,
    }, cookie);
    t.equal(res.statusCode, 400);

    res = yield makeGet();
    t.equal(res.result.events.length, 4, 'check for right count');
    t.equal(res.result.events[0].event, EVENTS.CAPTURE);

    // Test with close
    res = yield makeEvent(EVENTS.CLOSE, null, cookie);
    t.equal(res.statusCode, 200);
    res = yield makeGet();
    t.equal(res.result.events.length, 5, 'check for right count');
    t.equal(res.result.events[0].event, EVENTS.CLOSE);

    // Invalid close
    res = yield makeEvent(EVENTS.CLOSE);
    t.equal(res.statusCode, 400);
    res = yield makeGet();
    t.equal(res.result.events.length, 5, 'check for right count');
    t.equal(res.result.events[0].event, EVENTS.CLOSE);

    // Invalid event
    res = yield makeEvent('existentialcrisis');
    t.equal(res.statusCode, 400);
    res = yield makeGet();
    t.equal(res.result.events.length, 5, 'check for right count');
    t.equal(res.result.events[0].event, EVENTS.CLOSE);

    yield server.stop();

    t.end();
  }).catch(e => {
    server.stop();
    t.fail(e);
  });
});
