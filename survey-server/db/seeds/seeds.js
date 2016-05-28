/* eslint-disable */
const co = require('co');
const uuid = require('node-uuid');
const EVENTS = require('../../lib/handlers').EVENTS;

function create(knex) {
  function query(event, id, fingerprint, data) {
    const columns = {
      item_id: id,
      fingerprint: fingerprint,
      event: event,
    };
    if (data) {
      columns.data = data;
    }
    return knex('events').insert(columns);
  };

  return {
    impression(id, fingerprint) {
      return query(EVENTS.IMPRESSION, id, fingerprint);
    },

    conversion(id, fingerprint, value) {
      return query(EVENTS.CONVERSION, id, fingerprint, {
        data: {
          box: value
        }
      });
    },

    capture(id, fingerprint, data) {
      return query(EVENTS.CAPTURE, id, fingerprint, data);
    },

    close(id, fingerprint) {
      return query(EVENTS.CLOSE, id, fingerprint);
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
    for (let id = 0; id < articles; ++id) {
      // Have 100 total users see each survey
      const users = 100;
      for (let j = 0; j < users; ++j) {
        const fingerprint = uuid.v4();
        yield creator.impression(id, fingerprint);
        // Of those users one in 10 vote
        const voteRatio = 10;
        if (j % voteRatio === 0) {
          const value = Math.floor(j / 10);
          yield creator.conversion(id, fingerprint, value);
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
            yield creator.capture(id, fingerprint, data);
          }
          yield creator.close(id, fingerprint);
        }
      }
    }
  });
};
