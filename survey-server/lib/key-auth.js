const Boom = require('boom');
const assert = require('assert');

const internals = {};

function keyAuth() {
  const scheme = {
    authenticate(request, reply) {
      const isAuthorized = internals.key === request.query.key;
      if (!isAuthorized) {
        return reply(Boom.unauthorized());
      }
      return reply.continue();
    },
  };

  return scheme;
}

exports.register = function register(plugin, options, next) {
  internals.key = options.key;
  assert.ok(internals.key);

  plugin.auth.scheme('key', keyAuth);
  next();
};

exports.register.attributes = {
  name: 'key-auth',
  version: '1.0.0',
};
