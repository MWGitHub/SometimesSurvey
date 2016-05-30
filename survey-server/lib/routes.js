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
    path: `${api.path}/surveys/{survey_id}/items`,
    config: {
      auth: 'key',
      handler: handlers.getEvents,
      pre: [handlers.databaseCheck],
      validate: {
        params: {
          survey_id: Joi.number().integer().required(),
        },
        query: standard,
      },
    },
  },
  {
    method: 'GET',
    path: `${api.path}/surveys/{survey_id}/items/{id}`,
    config: {
      auth: 'key',
      handler: handlers.getItemEvents,
      pre: [handlers.databaseCheck],
      validate: {
        params: {
          survey_id: Joi.number().integer().required(),
          id: Joi.string().required(),
        },
        query: standard,
      },
    },
  },
  {
    method: 'GET',
    path: `${api.path}/surveys/{survey_id}/items/{id}/stats`,
    config: {
      auth: 'key',
      handler: handlers.getItemStats,
      pre: [handlers.databaseCheck],
      validate: {
        params: {
          survey_id: Joi.number().integer().required(),
          id: Joi.string().required(),
        },
      },
    },
  },
  {
    method: 'GET',
    path: `${api.path}/surveys/{survey_id}/items/{id}/status`,
    config: {
      handler: handlers.getStatus,
      validate: {
        params: {
          survey_id: Joi.number().integer().required(),
          id: Joi.string().required(),
        },
      },
    },
  },
  {
    method: 'POST',
    path: `${api.path}/surveys/{survey_id}/items/{id}/events`,
    config: {
      handler: handlers.logEvent,
      pre: [handlers.databaseCheck],
      validate: {
        params: {
          survey_id: Joi.number().integer().required(),
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
