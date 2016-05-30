/* eslint-disable import/no-unresolved */
/** @jsx element */
import faker from 'faker';
import { element, createApp } from 'deku';
import _ from 'lodash';

const surveyComponent = require('../index');

const Article = {
  render() {
    let paragraphs = [];
    for (let i = 0; i < 10; ++i) {
      let paragraph = '';
      for (let line = 0; line < 5; ++line) {
        paragraph += `${_.capitalize(faker.hacker.phrase())} `;
      }
      paragraph = _.trim(paragraph);
      paragraphs.push(paragraph);
    }
    paragraphs = paragraphs.map(v => <p>{v}</p>);

    return (
      <div>
        <h2>{faker.company.catchPhrase()}</h2>
        <img src={faker.image.image()} alt="main" />
        {paragraphs}
      </div>
    );
  },
};

document.addEventListener('DOMContentLoaded', () => {
  const render = createApp(document.getElementById('entry'));

  render(
    <div class="main">
      <h1>Survey Component Example</h1>
      <Article />
    </div>
  );
});
