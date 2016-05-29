const database = require('./database');
const co = require('co');
const Boom = require('boom');
const schemer = require('./schemer');
const _ = require('lodash');
const Joi = require('joi');
const uuid = require('node-uuid');
const api = require('./api');
const Iron = require('iron');

const internals = {
  EVENTS: {
    IMPRESSION: 'reader-survey-impression',
    CONVERSION: 'reader-survey-conversion',
    CAPTURE: 'social-capture',
    CLOSE: 'reader-survey-close',
  },

  EVENT_SHAPES: {
    IMPRESSION: {},
    CONVERSION: {
      box: Joi.number().integer()
        .min(1)
        .max(10)
        .required(),
    },
    CAPTURE: {
      name: Joi.string().valid('readerSurvey').required(),
      'after.survey': Joi.boolean().valid(true),
    },
    CLOSE: {},
  },

  isValidEvent(event, data) {
    const key = internals.EVENTS_INVERSE[event];
    if (!key) return false;

    const shape = internals.EVENT_SHAPES[key];
    const result = Joi.validate(data, shape);
    return result.error === null;
  },

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

  retrieveResults(query, request) {
    return co(function* retrieve() {
      const offset = request.query.offset || 0;
      const limit = request.query.limit || 0;

      const builder = internals.paginate(query, offset, limit);

      const response = {
        pagination: { offset, limit },
        events: yield builder,
      };
      return response;
    });
  },

  unseal(cookie) {
    return new Promise((resolve, reject) => {
      Iron.unseal(cookie, api.password, Iron.defaults, (err, unsealed) => {
        if (err) return reject(err);
        return resolve(unsealed);
      });
    });
  },
};

internals.EVENTS_INVERSE = _.invert(internals.EVENTS);

module.exports = {
  EVENTS: internals.EVENTS,

  databaseCheck(request, reply) {
    if (database.isConnected()) {
      return reply();
    }

    return reply().takeover();
  },

  getEvents(request, reply) {
    return co(function* events() {
      const query = database.knex().select().table('events');
      const response = yield internals.retrieveResults(query, request);
      return reply(response);
    }).catch(e => reply(Boom.badImplementation(e)));
  },

  getItemEvents(request, reply) {
    return co(function* events() {
      const query = database.knex().select().table('events')
        .where('item_key', request.params.id);
      const response = yield internals.retrieveResults(query, request);
      return reply(response);
    }).catch(e => reply(Boom.badImplementation(e)));
  },

  getItemStats(request, reply) {
    return co(function* stats() {
      const query = yield database.knex().raw(`
        SELECT
          AVG((data->>'box')::numeric)
        FROM
          events
        WHERE
          item_key = ? AND
          (data->'box') IS NOT NULL
      `, request.params.id);

      return reply({
        rating: parseFloat(query.rows[0].avg),
      });
    });
  },

  getStatus(request, reply) {
    const id = request.params.id;

    return co(function* status() {
      // Check if cookied against
      const cookie = request.state[id];
      if (cookie) {
        return reply({
          show: false,
        });
      }

      const isShown = yield schemer.checkStatus(id);

      return reply({
        show: isShown,
      });
    }).catch(e => reply(Boom.badImplementation(e)));
  },

  logEvent(request, reply) {
    const id = request.params.id;
    const event = request.payload.event;
    const data = request.payload.data;

    // Check if event shape is valid
    const valid = internals.isValidEvent(event, data || {});
    if (!valid) return reply(Boom.badRequest());

    return co(function* log() {
      // Check if item exists locally
      const knex = database.knex();
      let exists = yield knex('events').select().where('item_key', 'id')
        .limit(1);
      exists = exists.length > 0;

      // Check if item exists remotely
      if (!exists) exists = yield schemer.checkExists(id);

      // Item key is not valid
      if (!exists) return reply(Boom.badRequest());

      // Make cookie on each impression
      let makeCookie = false;
      let fingerprint = null;
      if (event === internals.EVENTS.IMPRESSION) {
        makeCookie = true;
        fingerprint = uuid.v4();
      } else if (request.state[id]) {
        const cookie = yield internals.unseal(request.state[id]);
        fingerprint = cookie;
      }

      // Do not allow events when impressions have not been made
      if (!fingerprint) return reply(Boom.badRequest());

      // Save event to database
      const model = {
        item_key: id,
        fingerprint,
        event,
      };
      if (data) {
        model.data = data;
      }
      yield knex('events').insert(model);

      if (makeCookie) {
        return reply().state(id, fingerprint, {
          ttl: api.ttl,
          password: api.password,
          encoding: 'iron',
        });
      }
      return reply();
    }).catch(e => reply(Boom.badImplementation(e)));
  },
};
