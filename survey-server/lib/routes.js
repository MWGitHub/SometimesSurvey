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
    path: `${api.path}/items/{id}`,
    config: {
      auth: 'key',
      handler: handlers.getItemEvents,
      pre: [handlers.databaseCheck],
      validate: {
        params: {
          id: Joi.string().required(),
        },
        query: standard,
      },
    },
  },
  {
    method: 'GET',
    path: `${api.path}/items/{id}/stats`,
    config: {
      auth: 'key',
      handler: handlers.getItemStats,
      pre: [handlers.databaseCheck],
      validate: {
        params: {
          id: Joi.string().required(),
        },
      },
    },
  },
  {
    method: 'GET',
    path: `${api.path}/items/{id}/status`,
    config: {
      handler: handlers.getStatus,
      validate: {
        params: {
          id: Joi.string().required(),
        },
      },
    },
  },
  {
    method: 'POST',
    path: `${api.path}/items/{id}/events`,
    config: {
      handler: handlers.logEvent,
      pre: [handlers.databaseCheck],
      validate: {
        params: {
          id: Joi.string().required(),
        },
        payload: {
          event: Joi.string().required(),
          data: Joi.any().optional(),
        },
      },
    },
  },
];
