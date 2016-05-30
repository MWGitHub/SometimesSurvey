const api = require('./api');
const handlers = require('./handlers');
const databaseCheck = require('./database').databaseCheck;
const Joi = require('joi');

const pagination = {
  offset: Joi.number().integer().min(0),
  limit: Joi.number().integer(),
};

const key = {
  key: Joi.string().required(),
};

const standard = Object.assign({}, key, pagination);

function surveyRoute(path, method, handler) {
  return {
    method,
    path,
    config: {
      auth: 'key',
      handler,
      pre: [databaseCheck],
      validate: {
        params: {
          survey_id: Joi.number().integer().required(),
        },
        query: key,
      },
    },
  };
}

module.exports = [
  {
    method: 'GET',
    path: `${api.path}/surveys`,
    config: {
      auth: 'key',
      handler: handlers.getSurveys,
      pre: [databaseCheck],
      validate: {
        query: key,
      },
    },
  },
  {
    method: 'POST',
    path: `${api.path}/surveys`,
    config: {
      auth: 'key',
      handler: handlers.createSurvey,
      pre: [databaseCheck],
      validate: {
        payload: {
          scheme: Joi.string().required(),
          question: Joi.string().required(),
        },
        query: key,
      },
    },
  },
  surveyRoute(`${api.path}/surveys/{survey_id}`, 'GET',
    handlers.getSurvey),
  surveyRoute(`${api.path}/surveys/{survey_id}/deploy`, 'POST',
    handlers.deploySurvey),
  surveyRoute(`${api.path}/surveys/{survey_id}/disable`, 'POST',
    handlers.disableSurvey),
  {
    method: 'GET',
    path: `${api.path}/surveys/{survey_id}/items`,
    config: {
      auth: 'key',
      handler: handlers.getEvents,
      pre: [databaseCheck],
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
      pre: [databaseCheck],
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
      pre: [databaseCheck],
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
      pre: [databaseCheck],
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
