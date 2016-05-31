/** @jsx element */
import faker from 'faker';
import { element, createApp } from 'deku';
import _ from 'lodash';
import debounce from 'light-debounce';
import Survey from 'survey-component';

import Article from './article';
import { createStore } from 'redux';
import { ACTIONS, reducer } from './reducers';

const initialState = {
  container: null,
  show: false,
  valid: false,
  question: 'Was this article worth your time?',
};

const store = createStore(reducer, initialState);

const articles = [];

function createArticle() {
  const paragraphs = [];
  for (let i = 0; i < 10; ++i) {
    let paragraph = '';
    for (let line = 0; line < 5; ++line) {
      paragraph += `${_.capitalize(faker.hacker.phrase())} `;
    }
    paragraph = _.trim(paragraph);
    paragraphs.push(paragraph);
  }

  return {
    title: faker.company.catchPhrase(),
    paragraphs,
    image: faker.image.image(),
  };
}

function dummyCheckItem() {
  return Promise.resolve(true);
}

function handleReset(dispatch) {
  return () => {
    dispatch({ type: ACTIONS.UPDATE_UI });
  };
}

function handleFetchItemStatus(dispatch) {
  return (result) => {
    if (result) {
      dispatch({ type: ACTIONS.SET_VALID });
    } else {
      dispatch({ type: ACTIONS.SET_INVALID });
    }
  };
}

function handleSurveyShown(dispatch) {
  return (result) => {
    dispatch({ type: ACTIONS.SHOW });
  };
}

function handleImpression(item) {
  console.log('track impression');
}

function handleLike(item) {
  console.log('track like');
}

function handleRate(item, value) {
  console.log('track rate', value);
}

function handleClose(dispatch) {
  return (item) => {
    console.log('track close');
    dispatch({ type: ACTIONS.HIDE });
  }
}

const Root = {
  render({ context, dispatch }) {
    console.log(context);
    const likeButton = <div class="fb-like" data-href="https://code-splat.com" data-layout="button" data-action="like" data-show-faces="false" data-share="false"></div>;
    return (
      <div>
        <div class="main">
          <button onClick={handleReset(dispatch)}>Reset</button>
          <h1>Survey Component Example</h1>
          <Article id="article-1" article={articles[0]} initial={true} />
          <Article id="article-2" article={articles[1]} />
          <Article id="article-3" article={articles[2]} />
        </div>
        <Survey
          container={context.container}
          item={0}
          onCheckItem={dummyCheckItem}
          onItemStatus={handleFetchItemStatus(dispatch)}
          onSurveyShown={handleSurveyShown(dispatch)}
          onImpression={handleImpression}
          onLike={handleLike}
          onRate={handleRate}
          show={context.show}
          valid={context.valid}
          liked={false}
          likeButton={likeButton}
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

  for (let i = 0; i < 3; ++i) {
    const article = createArticle();
    articles.push(article);
  }

  render(<Root />);
}

export default {
  start,
};
