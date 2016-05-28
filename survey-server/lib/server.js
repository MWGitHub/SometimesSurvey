const Hapi = require('hapi');
const schemer = require('./schemer');
const routes = require('./routes');
const keyAuth = require('./key-auth');

class Server {
  constructor(inputOptions) {
    const options = Object.assign({
      port: 8080,
      key: 'change this key!',
    }, inputOptions);
    this._config = options;
    this._server = new Hapi.Server();
    this._server.connection({ port: this._config.port });

    this._scheme = null;
  }
}

Server.prototype.initialize = function initialize() {
  const server = this._server;
  const key = this._config.key;
  return server.register([
    {
      register: keyAuth,
      options: {
        key,
      },
    },
  ]).then(() => {
    server.auth.strategy('key', 'key');
    server.route(routes);
    return server.initialize();
  });
};

Server.prototype.start = function start() {
  const server = this._server;
  return this.initialize()
    .then(() => server.start);
};

Server.prototype.stop = function stop() {
  return this._server.stop();
};

Server.prototype.setScheme = function setScheme(scheme) {
  if (!schemer.validScheme(scheme)) {
    throw new TypeError('Invalid scheme format');
  }

  this._scheme = scheme;
};

module.exports = Server;
