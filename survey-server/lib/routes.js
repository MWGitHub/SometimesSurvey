const api = require('./api');
const handlers = require('./handlers');

module.exports = [
  {
    method: 'GET',
    path: `${api.path}/items`,
    config: {
      auth: 'key',
      handler: handlers.getEvents,
      pre: [handlers.databaseCheck],
    },
  },
  {
    method: 'GET',
    path: `${api.path}/items/events/{type}`,
    config: {
      handler: handlers.logEvent,
      pre: [handlers.databaseCheck],
    },
  },
];
