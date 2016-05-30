const database = require('./database');
const co = require('co');
const Boom = require('boom');
const schemer = require('./schemer');
const uuid = require('node-uuid');
const api = require('./api');
const events = require('./events');

module.exports = {
  getSurveys(request, reply) {
    const knex = database.knex();
    co(function* () {
      const result = yield knex('surveys').select();
      reply({ surveys: result });
    }).catch(e => reply(Boom.badRequest(e)));
  },

  createSurvey(request, reply) {
    const knex = database.knex();
    const data = {
      scheme: request.payload.scheme,
    };
    if (request.payload.question) data.question = request.payload.question;
    if (request.payload.deployed) {
      data.deployed = request.payload.deployed;
      data.deploy_time = new Date();
    }

    co(function* getSurvey() {
      const result = yield knex('surveys').insert(data, 'id');
      reply({ id: result[0] });
    }).catch(e => reply(Boom.badRequest(e)));
  },

  getSurvey(request, reply) {
    const knex = database.knex();
    const id = request.params.survey_id;
    co(function* () {
      const result = yield knex('surveys').first().where('id', id);
      reply(result);
    }).catch(e => reply(Boom.badRequest(e)));
  },

  deploySurvey(request, reply) {
    const knex = database.knex();
    const id = request.params.survey_id;
    co(function* deploySurvey() {
      const result = yield knex('surveys').where('id', id).update({
        deployed: true,
        deploy_time: new Date(),
      });

      return reply(result);
    }).catch(e => reply(Boom.badRequest(e)));
  },

  disableSurvey(request, reply) {
    const knex = database.knex();
    const id = request.params.survey_id;
    co(function* deploySurvey() {
      const result = yield knex('surveys').where('id', id).update({
        deployed: false,
      });

      return reply(result);
    }).catch(e => reply(Boom.badRequest(e)));
  },
};
