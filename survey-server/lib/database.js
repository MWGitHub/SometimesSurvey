const knex = require('knex');
const knexfile = require('../knexfile');

const internals = {
  options: null,
  knex: null,
};

module.exports = {
  connect(options = knexfile) {
    internals.options = options[process.env.NODE_ENV];
    internals.knex = knex(options);
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
