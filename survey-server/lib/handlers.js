const database = require('./database');
const co = require('co');
const Boom = require('boom');

const internals = {
  paginate(query, offset, limit) {
    let builder = query;
    if (limit && limit > 0) {
      builder = builder.limit(limit);
    }
    if (offset && offset > 0) {
      builder = builder.offset(offset);
    }
    return builder;
  },
};

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
      query = internals.paginate(query, offset, limit);

      const response = {
        pagination: { offset, limit },
        events: yield query,
      };
      return reply(response);
    }).catch(e => reply(Boom.badImplementation(e)));
  },

  getItemEvents(request, reply) {
    return co(function* events() {
      const offset = request.query.offset || 0;
      const limit = request.query.limit || 0;

      let query = database.knex().select().table('events')
        .where('item_key', request.params.id);
      query = internals.paginate(query, offset, limit);

      const response = {
        pagination: { offset, limit },
        events: yield query,
      };
      return reply(response);
    }).catch(e => reply(Boom.badImplementation(e)));
  },

  getStatus(request, reply) {
    reply();
  },

  logEvent(request, reply) {
    reply();
  },
};
