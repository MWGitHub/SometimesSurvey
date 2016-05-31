const Hapi = require('hapi');
const schemer = require('./schemer');
const routes = require('./routes');
const keyAuth = require('./key-auth');
const knexfile = require('../knexfile');
const database = require('./database');
const api = require('./api');
const good = require('good');

class Server {
  constructor(inputOptions, connectionOptions) {
    const options = Object.assign({
      port: 8080,
      key: 'change this key!',
      useDatabase: true,
      databaseConfig: knexfile,
      schemes: null,
      password: 'change this key to something 32 characters or longer!',
    }, inputOptions);
    const connection = Object.assign({
      port: options.port,
    }, connectionOptions);

    this._config = options;
    this._server = new Hapi.Server();
    this._server.connection(connection);

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
  let plugins = [];
  if (process.env.NODE_ENV === 'development') {
    plugins.push({
      register: good,
      options: {
        reporters: {
          console: [{
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{ error: '*', log: '*', response: '*' }],
          }, {
            module: 'good-console',
          }, 'stdout'],
        },
      },
    });
  }
  plugins = plugins.concat([
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
        schemes: this._config.schemes,
      },
    },
  ]);

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
