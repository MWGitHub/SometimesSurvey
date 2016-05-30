const test = require('tape');
const co = require('co');
const moment = require('moment');
const Server = require('../lib/server');

const path = require('../lib/api').path;

test('test authentication on survey routes', t => {
  const server = new Server({ key: 'test' });

  co(function* initialize() {
    const instance = yield server.initialize();
    let res = yield instance.inject(`${path}/surveys`);
    t.equal(res.statusCode, 401, 'prevented access');

    res = yield instance.inject(`${path}/surveys?key=test`);
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
    const res = yield instance.inject(`${path}/surveys?key=test`);

    t.equal(res.result.surveys.length, 2, 'check for right count');
    t.equal(res.result.surveys[0].scheme, 'simple', 'check for right survey');

    yield server.stop();

    t.end();
  }).catch(e => {
    server.stop();
    t.fail(e);
  });
});

test('test survey creation', t => {
  const server = new Server({ key: 'test' });

  co(function* creation() {
    const date = moment().subtract(5, 'days').toDate();
    const instance = yield server.initialize();
    let res = yield instance.inject({
      method: 'POST',
      url: `${path}/surveys?key=test`,
      payload: {
        name: 'test',
        scheme: 'test',
        question: 'quest',
        deploy_time: date,
      },
    });
    const id = res.result.id;

    res = yield instance.inject(`${path}/surveys?key=test`);
    const surveys = res.result.surveys;
    t.equal(surveys.length, 3, 'check for right count');
    t.equal(surveys[surveys.length - 1].scheme, 'test', 'check for right survey');
    t.equal(surveys[surveys.length - 1].id, id, 'check for right survey');
    t.equal(surveys[surveys.length - 1].deploy_time.toString(),
      date.toString(), 'check for right time');

    yield server.stop();

    t.end();
  }).catch(e => {
    server.stop();
    t.fail(e);
  });
});

test('test single survey retrieval', t => {
  const server = new Server({ key: 'test' });

  co(function* initialize() {
    const instance = yield server.initialize();

    let res = yield instance.inject(`${path}/surveys/1?key=test`);
    t.equal(res.result.scheme, 'simple', 'check for right survey');

    res = yield instance.inject(`${path}/surveys/simple?key=test`);
    t.equal(res.result.scheme, 'simple', 'check for right survey');

    yield server.stop();

    t.end();
  }).catch(e => {
    server.stop();
    t.fail(e);
  });
});

test('test single survey deployment', t => {
  const server = new Server({ key: 'test' });

  co(function* initialize() {
    const instance = yield server.initialize();
    const date = moment().subtract(3, 'days');

    let res = yield instance.inject(`${path}/surveys/2?key=test`);
    t.equal(res.result.deployed, false, 'check for survey status');

    res = yield instance.inject({
      method: 'POST',
      url: `${path}/surveys/2/deploy?key=test`,
      payload: {
        deploy_time: date,
      },
    });

    res = yield instance.inject(`${path}/surveys/2?key=test`);
    t.equal(res.result.deployed, true, 'check for survey status');
    t.equal(res.result.deploy_time.toString(),
      date.toDate().toString(), 'check for correct deploy time');

    yield server.stop();

    t.end();
  }).catch(e => {
    server.stop();
    t.fail(e);
  });
});

test('test single survey disabling', t => {
  const server = new Server({ key: 'test' });

  co(function* initialize() {
    const instance = yield server.initialize();

    let res = yield instance.inject(`${path}/surveys/simple?key=test`);
    t.equal(res.result.deployed, true, 'check for survey status');

    res = yield instance.inject({
      method: 'POST',
      url: `${path}/surveys/1/disable?key=test`,
    });

    res = yield instance.inject(`${path}/surveys/1?key=test`);
    t.equal(res.result.deployed, false, 'check for survey status');

    yield server.stop();

    t.end();
  }).catch(e => {
    server.stop();
    t.fail(e);
  });
});
