const assert = require('assert');

const api = {
  version: 1,

  path: '/v1',

  password: null,

  ttl: 1000 * 60 * 60 * 24 * 7,

  register(server, options, next) {
    api.password = options.password;
    assert.ok(api.password);

    api.ttl = options.ttl || api.ttl;

    next();
  },
};
api.register.attributes = {
  name: 'api',
  version: '1.0.0',
};

module.exports = api;
