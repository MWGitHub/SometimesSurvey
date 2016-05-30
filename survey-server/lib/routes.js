const api = require('./api');
const surveyHandlers = require('./survey-handlers');
const itemHandlers = require('./item-handlers');
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

const surveyIdValidation = Joi.alternatives().try(
  Joi.number().integer().required(),
  Joi.string().required()
);

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
          survey_id: surveyIdValidation,
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
      handler: surveyHandlers.getSurveys,
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
      handler: surveyHandlers.createSurvey,
      pre: [databaseCheck],
      validate: {
        payload: {
          name: Joi.string().required(),
          scheme: Joi.string().required(),
          question: Joi.string().required(),
        },
        query: key,
      },
    },
  },
  surveyRoute(`${api.path}/surveys/{survey_id}`, 'GET',
    surveyHandlers.getSurvey),
  surveyRoute(`${api.path}/surveys/{survey_id}/deploy`, 'POST',
    surveyHandlers.deploySurvey),
  surveyRoute(`${api.path}/surveys/{survey_id}/disable`, 'POST',
    surveyHandlers.disableSurvey),
  {
    method: 'GET',
    path: `${api.path}/surveys/{survey_id}/items`,
    config: {
      auth: 'key',
      handler: itemHandlers.getEvents,
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
      handler: itemHandlers.getItemEvents,
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
      handler: itemHandlers.getItemStats,
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
      handler: itemHandlers.getStatus,
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
      handler: itemHandlers.logEvent,
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
