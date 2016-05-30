const knex = require('knex');

const internals = {
  options: null,
  knex: null,
};

const database = {
  connect(options) {
    if (!options) return;

    internals.options = options[process.env.NODE_ENV];
    internals.knex = knex(internals.options);
  },

  isConnected() {
    return !!internals.knex;
  },

  knex() {
    return internals.knex;
  },

  close() {
    if (database.isConnected()) internals.knex.destroy();
  },

  databaseCheck(request, reply) {
    if (database.isConnected()) {
      return reply();
    }

    return reply().takeover();
  },
};

module.exports = database;
