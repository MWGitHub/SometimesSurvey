/**
 * Simple authentication that checks for a matching API key.
 */

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
      return reply.continue({ credentials: true });
    },
  };

  return scheme;
}

exports.register = function register(server, options, next) {
  internals.key = options.key;
  assert.ok(internals.key);

  server.auth.scheme('key', keyAuth);
  next();
};

exports.register.attributes = {
  name: 'key-auth',
  version: '1.0.0',
};
