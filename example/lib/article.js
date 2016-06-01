/** @jsx element */
import { element } from 'deku';
import { ACTIONS } from './reducers';

const Article = {
  render({ props }) {
    const article = props.article;
    const paragraphs = article.text.map(v => <p class="article__text">{v}</p>);

    return (
      <div id={props.id} class="article">
        <h2 class="article__title">{article.title}</h2>
        <img class="article__image" src={article.image} alt="main" />
        {paragraphs}
      </div>
    );
  },

  onCreate({ props: { initial, id }, dispatch, context }) {
    if (initial) {
      setTimeout(() => {
        const container = document.getElementById(id);
        if (container !== context.container) {
          dispatch({ type: ACTIONS.SET_CONTAINER, container });
        }
      }, 0);
    }
  },

  onUpdate({ props: { initial, id }, dispatch, context }) {
    if (initial) {
      setTimeout(() => {
        const container = document.getElementById(id);
        if (container !== context.container) {
          dispatch({ type: ACTIONS.SET_CONTAINER, container });
        }
      }, 0);
    }
  },
};

export default Article;
