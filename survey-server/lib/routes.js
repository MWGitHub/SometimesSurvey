const api = require('./api');
const handlers = require('./handlers');
const Joi = require('joi');

const pagination = {
  offset: Joi.number().integer().min(0),
  limit: Joi.number().integer(),
};

const standard = Object.assign({
  key: Joi.string().required(),
}, pagination);

module.exports = [
  {
    method: 'GET',
    path: `${api.path}/items`,
    config: {
      auth: 'key',
      handler: handlers.getEvents,
      pre: [handlers.databaseCheck],
      validate: {
        query: standard,
      },
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
