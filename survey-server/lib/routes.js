const config = require('./config');
const handlers = require('./handlers');

module.exports = [
  {
    method: 'GET',
    path: `${config.path}/`,
    config: {
      auth: 'key',
      handler: handlers.getSurveys,
      pre: [handlers.preDatabase],
    },
  },
];
