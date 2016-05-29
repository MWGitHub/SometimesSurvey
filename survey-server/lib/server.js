const Hapi = require('hapi');
const schemer = require('./schemer');
const routes = require('./routes');
const keyAuth = require('./key-auth');
const knexfile = require('../knexfile');
const database = require('./database');
const api = require('./api');

class Server {
  constructor(inputOptions) {
    const options = Object.assign({
      port: 8080,
      key: 'change this key!',
      useDatabase: true,
      databaseConfig: knexfile,
      scheme: null,
      password: 'change this key to something 32 characters or longer!',
    }, inputOptions);

    this._config = options;
    this._server = new Hapi.Server();
    this._server.connection({ port: this._config.port });

    this._scheme = null;
  }
}

/**
 * Initialize the server without starting it.
 * @return {Promise} a promise with the server.
 */
Server.prototype.initialize = function initialize() {
  // Connect to the database if enabled
  if (this._config.useDatabase) {
    database.connect(this._config.databaseConfig);
  }

  const server = this._server;
  const plugins = [
    {
      register: api,
      options: {
        password: this._config.password,
      },
    },
    {
      register: keyAuth,
      options: {
        key: this._config.key,
      },
    },
    {
      register: schemer,
      options: {
        scheme: this._config.scheme,
      },
    },
  ];

  return server.register(plugins).then(() => {
    server.auth.strategy('key', 'key');
    server.route(routes);
    return server.initialize();
  }).then(() => server);
};

/**
 * Start the server.
 * @return {Promise} a promise with the server.
 */
Server.prototype.start = function start() {
  const server = this._server;
  return this.initialize()
    .then(() => server.start())
    .then(() => server);
};

/**
 * Stop the server.
 * @return {Promise} a promise when the server stops.
 */
Server.prototype.stop = function stop() {
  if (this._config.useDatabase) {
    database.close();
  }
  return this._server.stop();
};

module.exports = Server;
