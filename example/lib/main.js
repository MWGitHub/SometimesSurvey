/** @jsx element */
require('survey-component/index.css');

import faker from 'faker';
import { element, createApp } from 'deku';
import _ from 'lodash';
import debounce from 'light-debounce';

import Survey from 'survey-component';
require('../style/main.css');

const store = {
  container: null,
  show: false,
  valid: false,
  question: 'Was this article worth your time?',
};

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

const Article = {
  render({ props }) {
    const article = articles[props.article];
    const paragraphs = article.paragraphs.map(v => <p>{v}</p>);

    return (
      <div id={props.id}>
        <h2>{article.title}</h2>
        <img src={article.image} alt="main" />
        {paragraphs}
      </div>
    );
  },

  onCreate({ props: { initial }, dispatch }) {
    if (initial) {
      setTimeout(() => {
        dispatch(() => {
          store.container = document.getElementById('article-1');
        });
      }, 0);
    }
  },
};

function dummyCheckItem() {
  return Promise.resolve(true);
}

const Root = {

  render({ dispatch }) {
    const likeButton = <div class="fb-like" data-href="https://code-splat.com" data-layout="button" data-action="like" data-show-faces="false" data-share="false"></div>;
    return (
      <div>
        <div class="main">
          <button onClick={() => dispatch()}>Dispatch</button>
          <h1>Survey Component Example</h1>
          <Article id="article-1" article={0} initial={true} />
          <Article id="article-2" article={1} />
          <Article id="article-3" article={2} />
        </div>
        <Survey
          container={store.container}
          item={0}
          onCheckItem={dummyCheckItem}
          onItemStatus={(result) => { store.valid = result; dispatch(); }}
          onSurveyShown={(item) => { store.show = true; dispatch(); }}
          show={store.show}
          valid={store.valid}
          liked={false}
          likeButton={likeButton}
          question={store.question}
          onLike={() => {}}
          onRate={() => {}}
          onClose={() => { store.show = false; dispatch() }}
          FB={window.FB}
        />
      </div>
    );
  },
};

document.addEventListener('DOMContentLoaded', () => {
  function dispatch(action) {
    if (action && typeof action === 'function') {
      action(store);
    }
    update();
  }

  const render = createApp(document.getElementById('entry'), dispatch);
  const update = debounce(() => { render(<Root />) });


  for (let i = 0; i < 3; ++i) {
    const article = createArticle();
    articles.push(article);
  }

  render(<Root />);
});
