/* eslint-disable */
const co = require('co');
const uuid = require('node-uuid');
const EVENTS = require('../../lib/events').EVENTS;

function create(knex, surveyID) {
  function query(event, key, fingerprint, data) {
    const columns = {
      item_key: key.toString(),
      fingerprint: fingerprint,
      survey_id: surveyID,
      event: event,
    };
    if (data) {
      columns.data = data;
    }
    return knex('events').insert(columns);
  };

  return {
    impression(key, fingerprint) {
      return query(EVENTS.IMPRESSION, key, fingerprint);
    },

    conversion(key, fingerprint, value) {
      return query(EVENTS.CONVERSION, key, fingerprint, {
        box: value
      });
    },

    capture(key, fingerprint, data) {
      return query(EVENTS.CAPTURE, key, fingerprint, data);
    },

    close(key, fingerprint) {
      return query(EVENTS.CLOSE, key, fingerprint);
    },
  };
}

exports.seed = function(knex, Promise) {
  return co(function* () {
    // Deletes ALL existing entries
    yield knex('events').del();
    yield knex('surveys').del();

    yield knex.raw('ALTER SEQUENCE surveys_id_seq RESTART WITH 1');
    yield knex.raw('ALTER SEQUENCE events_id_seq RESTART WITH 1');

    // Create a survey to use
    const results = yield knex('surveys').insert([
      {
        name: 'simple',
        scheme: 'simple',
        question: 'Was this article worth your time?',
        deployed: true,
        deploy_time: new Date(),
      },
      {
        name: 'inactive',
        scheme: 'inactive',
        question: 'something',
        deployed: false,
        deploy_time: new Date(),
      },
    ], 'id');

    for (let survey = 0; survey < results.length; ++survey) {
      const creator = create(knex, results[survey]);

      // Each article survey is seen by 100 users
      const articles = 10;
      for (let article = 0; article < articles; ++article) {
        const users = 100;
        for (let user = 0; user < users; ++user) {
          const key = article;

          const fingerprint = uuid.v4();
          yield creator.impression(key, fingerprint);
          // Of those users one in 10 vote
          const voteRatio = 10;
          if (user % voteRatio === 0) {
            const value = Math.floor(user / voteRatio) + 1;
            yield creator.conversion(key, fingerprint, value);
            // Of the ones that vote half like
            const likeRatio = 2;
            if (value % likeRatio === 0) {
              // Of the ones that like around half are on mobile
              const data = {
                name: 'readerSurvey',
              };
              if (value < voteRatio / likeRatio / 2) {
                data['after.survey'] = true;
              }
              yield creator.capture(key, fingerprint, data);
            }
            yield creator.close(key, fingerprint);
          }
        }
      }
    }
  });
};
