const Joi = require('joi');
const _ = require('lodash');

const events = {
  EVENTS: {
    IMPRESSION: 'reader-survey-impression',
    CONVERSION: 'reader-survey-conversion',
    CAPTURE: 'social-capture',
    CLOSE: 'reader-survey-close',
  },

  EVENT_SHAPES: {
    IMPRESSION: {},
    CONVERSION: {
      box: Joi.number().integer()
        .min(1)
        .max(10)
        .required(),
    },
    CAPTURE: {
      name: Joi.string().valid('readerSurvey').required(),
      'after.survey': Joi.boolean().valid(true),
    },
    CLOSE: {},
  },

  isValidEvent(event, data) {
    const key = events.EVENTS_INVERSE[event];
    if (!key) return false;

    const shape = events.EVENT_SHAPES[key];
    const result = Joi.validate(data, shape);
    return result.error === null;
  },
};
events.EVENTS_INVERSE = _.invert(events.EVENTS);

module.exports = events;
