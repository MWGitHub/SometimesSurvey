const assert = require('assert');
const Iron = require('iron');
const co = require('co');

/**
 * Helper constants and functions to use with handlers and routes.
 * @type {Object}
 */
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

  unseal(cookie) {
    return new Promise((resolve, reject) => {
      Iron.unseal(cookie, api.password, Iron.defaults, (err, unsealed) => {
        if (err) return reject(err);
        return resolve(unsealed);
      });
    });
  },

  paginate(query, offset, limit) {
    let builder = query;
    if (limit && limit > 0) {
      builder = builder.limit(limit);
    }
    if (offset && offset > 0) {
      builder = builder.offset(offset);
    }
    return builder;
  },

  retrieveResults(query, request) {
    return co(function* retrieve() {
      const offset = request.query.offset || 0;
      const limit = request.query.limit || 0;

      const builder = api.paginate(query, offset, limit);

      const response = {
        pagination: { offset, limit },
        events: yield builder,
      };
      return response;
    });
  },
};
api.register.attributes = {
  name: 'api',
  version: '1.0.0',
};

module.exports = api;
