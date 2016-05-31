/** @jsx element */
import { element } from 'deku';
import { ACTIONS } from './reducers';

const Article = {
  render({ props }) {
    const article = props.article;
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
        const container = document.getElementById('article-1');
        dispatch({ type: ACTIONS.SET_CONTAINER, container });
      }, 0);
    }
  },

  onUpdate(model) {

  },
};

export default Article;
