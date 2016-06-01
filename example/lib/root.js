/** @jsx element */
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
const transition = 1000;

function reset(dispatch) {
  dispatch({ type: ACTIONS.SET_CONTAINER, container: null });
  dispatch({ type: ACTIONS.SET_INVALID });
  dispatch({ type: ACTIONS.HIDE });

  setTimeout(() => {
    dispatch({ type: ACTIONS.UPDATE_UI });
  }, transition * 1.5);
}

function handleDeleteCookie(context, dispatch) {
  const survey = context.survey;

  return () => {
    if (!survey) return;

    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; ++i) {
      const cookie = cookies[i];
      const index = cookie.indexOf('=');
      const name = index > -1 ? cookie.substr(0, index) : cookie;
      if (_.trim(name) === `survey-${survey}`) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    }
    api.invalidateCookie(survey).then(() => {
      reset(dispatch);
    });
  };
}

function handleDeleteFacebook() {
  localStorage.removeItem('subscribed');
}

function handleCheckItem(survey, item) {
  if (!survey) return Promise.resolve(false);

  return api.fetchStatus(survey, item);
}

function handleFetchItemStatus(dispatch) {
  return (survey, item, result) => {
    if (result && result.show) {
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
  api.postEvent(survey, item, {
    event: 'reader-survey-impression',
  });
  window.ga('send', 'event', 'survey', 'reader-survey-impression');
}

function handleRate(survey, item, value) {
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
  const event = {
    event: 'social-capture',
    data: {
      name: 'readerSurvey',
    },
  };
  window.ga('send', 'event', 'social-capture', 'name', 'readerSurvey');
  if (util.isMobile()) {
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
        <div class="toolbar">
          <div>
            <h2 class="toolbar__logo">
              <a class="contrast-link--plain" href="/">Sometimes Survey</a>
            </h2>
          </div>
          <div>
            <button
              class="toolbar__item"
              onClick={handleDeleteCookie(context, dispatch)}
            >
              Delete Cookie
            </button>
            <button
              class="toolbar__item"
              onClick={handleDeleteFacebook}
            >
              Delete Facebook
            </button>
          </div>
        </div>
        <div class="main">
          <h1 class="title">Survey Component Examples</h1>
          <Article id="article-1" article={articles.always} initial />
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
