const database = require('./database');
const co = require('co');
const Boom = require('boom');
const schemer = require('./schemer');
const uuid = require('node-uuid');
const api = require('./api');
const events = require('./events');

module.exports = {
  getEvents(request, reply) {
    const surveyID = request.params.survey_id;
    return co(function* event() {
      const query = database.knex().select().table('events')
        .where('survey_id', surveyID)
        .orderBy('id');
      const response = yield api.retrieveResults(query, request);
      return reply(response);
    }).catch(e => reply(Boom.badImplementation(e)));
  },

  getItemEvents(request, reply) {
    const surveyID = request.params.survey_id;
    return co(function* event() {
      const query = database.knex().select().table('events')
        .where({
          survey_id: surveyID,
          item_key: request.params.id,
        })
        .orderBy('id');
      const response = yield api.retrieveResults(query, request);
      return reply(response);
    }).catch(e => reply(Boom.badImplementation(e)));
  },

  getItemStats(request, reply) {
    const surveyID = request.params.survey_id;
    return co(function* stats() {
      const query = yield database.knex().raw(`
        SELECT
          AVG((data->>'box')::numeric)
        FROM
          events
        WHERE
          survey_id = ? AND
          item_key = ? AND
          (data->'box') IS NOT NULL
      `, [surveyID, request.params.id]);

      return reply({
        rating: parseFloat(query.rows[0].avg),
      });
    }).catch(e => reply(Boom.badRequest(e)));
  },

  getStatus(request, reply) {
    const surveyID = request.params.survey_id;
    const id = request.params.id;

    return co(function* status() {
      // Check if cookied against
      const cookieName = `survey-${surveyID}`;
      const cookie = request.state[cookieName];
      if (cookie) {
        return reply({
          show: false,
        });
      }

      const result = {
        show: false,
      };
      if (database.isConnected()) {
        const knex = database.knex();
        const survey = yield knex('surveys').first().where('id', surveyID);
        if (!survey) return false;
        result.show = yield schemer.checkStatus(
          id, survey.scheme, survey.deploy_time
        );
        result.question = survey.question;
      } else {
        result.show = yield schemer.checkStatus(id);
      }


      return reply(result);
    }).catch(e => reply(Boom.badImplementation(e)));
  },

  logEvent(request, reply) {
    const surveyID = request.params.survey_id;
    const id = request.params.id;
    const event = request.payload.event;
    const data = request.payload.data;

    // Check if event shape is valid
    const valid = events.isValidEvent(event, data || {});
    if (!valid) return reply(Boom.badRequest());

    return co(function* log() {
      // Make sure not making an impression when a cookie is present
      const cookieName = `survey-${surveyID}`;
      if (event === events.EVENTS.IMPRESSION && request.state[cookieName]) {
        return reply(Boom.badRequest());
      }

      // Check if item exists locally
      const knex = database.knex();
      let exists = yield knex('events').select()
        .where({
          survey_id: surveyID,
          item_key: id,
        })
        .limit(1);
      exists = exists.length > 0;

      // Check if item exists remotely
      const survey = yield knex('surveys').first().where('id', surveyID);
      if (!exists) exists = yield schemer.checkExists(id, survey.scheme);

      // Item key is not valid
      if (!exists) return reply(Boom.badRequest());

      // Make cookie on each impression
      let makeCookie = false;
      let fingerprint = null;
      if (event === events.EVENTS.IMPRESSION) {
        makeCookie = true;
        fingerprint = uuid.v4();
      } else if (request.state[cookieName]) {
        const cookie = yield api.unseal(request.state[cookieName]);
        fingerprint = cookie;
      }

      // Do not allow events when impressions have not been made
      if (!fingerprint) return reply(Boom.badRequest());

      // Save event to database
      const model = {
        item_key: id,
        fingerprint,
        event,
        survey_id: surveyID,
      };
      if (data) {
        model.data = data;
      }
      yield knex('events').insert(model);

      if (makeCookie) {
        return reply().state(cookieName, fingerprint, {
          ttl: api.ttl,
          password: api.password,
          encoding: 'iron',
          isHttpOnly: false,
          path: '/',
        });
      }
      return reply();
    }).catch(e => reply(Boom.badImplementation(e)));
  },
};
