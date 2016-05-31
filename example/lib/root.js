/** @jsx element */
import faker from 'faker';
import { element, createApp } from 'deku';
import _ from 'lodash';
import debounce from 'light-debounce';
import Survey from 'survey-component';

import Article from './article';
import { createStore } from 'redux';
import { ACTIONS, reducer } from './reducers';
import co from 'co';
import api from './api';
import util from './util';
import seeds from './seeds';

const initialState = {
  show: false,
  valid: false,
  question: 'Was this article worth your time?',
};

const store = createStore(reducer, initialState);

const articles = seeds.articles;

function handleReset(dispatch) {
  return () => {
    dispatch({ type: ACTIONS.UPDATE_UI });
  };
}

function handleCheckItem(survey, item) {
  if (!survey) return Promise.resolve(false);

  return api.fetchStatus(survey, item);
}

function handleFetchItemStatus(dispatch) {
  return (survey, item, result) => {
    if (result) {
      dispatch({ type: ACTIONS.SET_VALID });
    } else {
      dispatch({ type: ACTIONS.SET_INVALID });
    }
  };
}

function handleSurveyShown(dispatch) {
  return () => {
    dispatch({ type: ACTIONS.SHOW });
  };
}

function handleImpression(survey, item) {
  console.log('track impression');
  api.postEvent(survey, item, {
    event: 'reader-survey-impression',
  });
  window.ga('send', 'event', 'survey', 'reader-survey-impression');
}

function handleRate(survey, item, value) {
  console.log('track rate', value);
  api.postEvent(survey, item, {
    event: 'reader-survey-conversion',
    data: {
      box: value,
    },
  });
  window.ga('send', 'event', 'survey', 'reader-survey-conversion',
    'box', value);
  localStorage.setItem('surveys', JSON.stringify([{
    href: window.location.href,
    article_id: item,
    response: value,
    referrer: document.referrer,
    timestamp: Math.floor(Date.now() / 1000),
  }]));
}

function handleLike(survey, item) {
  console.log('track like');
  const event = {
    event: 'social-capture',
    data: {
      name: 'readerSurvey',
    },
  };
  window.ga('send', 'event', 'social-capture', 'name', 'readerSurvey');
  if (util.isMobile()) {
    console.log('mobile');
    window.ga('send', 'event', 'social-capture', 'after.survey', 'true');
    event.data['after.survey'] = true;
  }
  api.postEvent(survey, item, event);
  localStorage.setItem('subscribed', true);
}

function handleClose(dispatch) {
  return () => {
    dispatch({ type: ACTIONS.HIDE });
  };
}

function handleLikeClose(survey, item) {
  console.log('track like close');
  api.postEvent(survey, item, {
    event: 'reader-survey-close',
  });
  window.ga('send', 'event', 'survey', 'reader-survey-close');
}

const Root = {
  render({ context, dispatch }) {
    const liked = !!localStorage.getItem('subscribed');
    return (
      <div>
        <div class="main">
          <button onClick={handleReset(dispatch)}>Reset</button>
          <h1>Survey Component Example</h1>
          <Article id="article-1" article={articles.always} initial={true} />
          <Article id="article-2" article={articles.publishedBefore} />
          <Article id="article-3" article={articles.old} />
        </div>
        <Survey
          container={context.container}
          survey={context.survey}
          item={context.item}
          onCheckItem={handleCheckItem}
          onItemStatus={handleFetchItemStatus(dispatch)}
          onSurveyShown={handleSurveyShown(dispatch)}
          onImpression={handleImpression}
          onLikeClose={handleLikeClose}
          onLike={handleLike}
          onRate={handleRate}
          show={context.show}
          valid={context.valid}
          liked={liked}
          likeButton={util.likeButton}
          question={context.question}
          onClose={handleClose(dispatch)}
          stateAction={{ type: ACTIONS.UPDATE_UI }}
          FB={window.FB}
        />
      </div>
    );
  },
};

function start() {
  const render = createApp(document.getElementById('entry'), store.dispatch);
  const update = debounce(() => { render(<Root />, store.getState()); });
  store.subscribe(() => {
    update();
  });

  co(function* fetchSurvey() {
    const survey = yield api.fetchSurvey('article');

    store.dispatch({ type: ACTIONS.SET_SURVEY, survey: survey.id });
    store.dispatch({ type: ACTIONS.SET_QUESTION, question: survey.question });
    store.dispatch({ type: ACTIONS.SET_ITEM, item: 'always' });
  }).then();

  render(<Root />);
}

export default {
  start,
};
