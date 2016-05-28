const knex = require('knex');

const internals = {
  options: null,
  knex: null,
};

module.exports = {
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
    if (this.isConnected()) internals.knex.destroy();
  },

};
