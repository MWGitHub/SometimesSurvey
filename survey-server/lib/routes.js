const api = require('./api');
const handlers = require('./handlers');
const Joi = require('joi');
const _ = require('lodash');

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
    path: `${api.path}/items/{id}/events`,
    config: {
      handler: handlers.getStatus,
      pre: [handlers.databaseCheck],
      validate: {
        params: {
          id: Joi.string().required(),
        },
        payload: {
          event: Joi.string().valid(_.values(handlers.EVENTS)),
          data: Joi.any().optional(),
        },
      },
    },
  },
  {
    method: 'GET',
    path: `${api.path}/items/{id}/events`,
    config: {
      handler: handlers.logEvent,
      pre: [handlers.databaseCheck],
      validate: {
        params: {
          id: Joi.string().required(),
        },
        payload: {
          event: Joi.string().valid(_.values(handlers.EVENTS)),
          data: Joi.any().optional(),
        },
      },
    },
  },
];
