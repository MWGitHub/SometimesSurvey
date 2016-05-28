const database = require('./database');
const co = require('co');
const Boom = require('boom');
const api = require('./api');

module.exports = {
  EVENTS: {
    IMPRESSION: 'reader-survey-impression',
    CONVERSION: 'reader-survey-conversion',
    CAPTURE: 'social-capture',
    CLOSE: 'reader-survey-close',
  },

  databaseCheck(request, reply) {
    if (database.isConnected()) {
      return reply();
    }

    return reply().takeover();
  },

  getEvents(request, reply) {
    return co(function* events() {
      const offset = request.query.offset || 0;
      const limit = request.query.limit || 0;

      let query = database.knex().select().table('events');
      if (limit > 0) {
        query = query.limit(limit);
      }
      if (offset > 0) {
        query = query.offset(offset);
      }

      const response = {
        pagination: { offset, limit },
        events: yield query,
      };
      return reply(response);
    }).catch(e => reply(Boom.badImplementation(e)));
  },

  logEvent(request, reply) {
    reply();
  },
};
