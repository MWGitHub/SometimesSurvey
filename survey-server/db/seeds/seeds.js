/* eslint-disable */
const co = require('co');
const uuid = require('node-uuid');
const EVENTS = require('../../lib/handlers').EVENTS;

function create(knex) {
  function query(event, key, fingerprint, data) {
    const columns = {
      item_key: key.toString(),
      fingerprint: fingerprint,
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
        data: {
          box: value
        }
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
  const creator = create(knex);

  return co(function* () {
    // Deletes ALL existing entries
    yield knex('events').del();

    // Have 10 total articles
    const articles = 10;
    for (let key = 0; key < articles; ++key) {
      // Have 100 total users see each survey
      const users = 100;
      for (let j = 0; j < users; ++j) {
        const fingerprint = uuid.v4();
        yield creator.impression(key, fingerprint);
        // Of those users one in 10 vote
        const voteRatio = 10;
        if (j % voteRatio === 0) {
          const value = Math.floor(j / 10);
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
  });
};
