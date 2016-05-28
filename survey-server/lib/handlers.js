const database = require('./database');
const co = require('co');
const Boom = require('boom');

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
      const result = yield database.knex().select().table('events');
      return reply(result);
    }).catch(e => reply(Boom.badImplementation(e)));
  },

  logEvent(request, reply) {
    reply();
  },
};
