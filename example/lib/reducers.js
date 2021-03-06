import { combineReducers } from 'redux';

const ACTIONS = {
  SET_SURVEY: 'SET_SURVEY',
  SET_ITEM: 'SET_ITEM',
  SET_CONTAINER: 'SET_CONTAINER',
  SET_VALID: 'SET_VALID',
  SET_INVALID: 'SET_INVALID',
  SHOW: 'SHOW',
  HIDE: 'HIDE',
  SET_QUESTION: 'SET_QUESTION',
  UPDATE_UI: 'UPDATE_UI',
};

function update(state = {}, action) {
  switch (action.type) {
    case 'UPDATE_UI':
      return state;
    default:
      return state;
  }
}

function survey(state = null, action) {
  switch (action.type) {
    case 'SET_SURVEY':
      return action.survey;
    default:
      return state;
  }
}

function item(state = null, action) {
  switch (action.type) {
    case 'SET_ITEM':
      return action.item;
    default:
      return state;
  }
}

function container(state = null, action) {
  switch (action.type) {
    case 'SET_CONTAINER':
      return action.container;
    default:
      return state;
  }
}

function show(state = {}, action) {
  switch (action.type) {
    case 'SHOW':
      return true;
    case 'HIDE':
      return false;
    default:
      return state;
  }
}

function valid(state = {}, action) {
  switch (action.type) {
    case 'SET_VALID':
      return true;
    case 'SET_INVALID':
      return false;
    default:
      return state;
  }
}

function question(state = {}, action) {
  switch (action.type) {
    case 'SET_QUESTION':
      return action.question;
    default:
      return state;
  }
}

module.exports = {
  ACTIONS,
  reducer: combineReducers({
    update,
    survey,
    item,
    container,
    show,
    valid,
    question,
  }),
};
