const Hapi = require('hapi');
const schemer = require('./schemer');

class Server {
  constructor(inputOptions) {
    const options = Object.assign({
      port: 8080,
      key: 'change this key!',
    }, inputOptions);
    this._config = options;
    this._server = new Hapi.Server();
    this._scheme = null;
  }
}

Server.prototype.start = function start() {
  this._server.connection({ port: this._config.port });
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
