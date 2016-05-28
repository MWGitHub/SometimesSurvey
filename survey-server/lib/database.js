const knex = require('knex');
const knexfile = require('../knexfile');

const internals = {
  options: null,
  knex: null,
};

module.exports = {
  isConnected() {
    return !!internals.knex;
  },

  connect(options = knexfile) {
    internals.options = options[process.env.NODE_ENV];
    internals.knex = knex(options);
  },

  knex() {
    return internals.knex;
  },

  migrate() {
    if (this.isConnected()) {
      return internals.knex.migrate.latest();
    }

    return Promise.resolve();
  },

  close() {
    if (this.isConnected()) internals.knex.destroy();
  },

};
