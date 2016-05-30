const Server = require('survey-server').Server;

const articles = require('survey-scheme-article').seed.articles;
const deployTime = require('survey-scheme-article').seed.deploy;
const articleScheme = require('survey-scheme-article').scheme(key =>
  Promise.resolve(articles[key])
);
const knexfile = require('./knexfile');

const server = new Server({
  port: 6005,
  key: 'test',
  databaseConfig: knexfile,
  schemes: {
    article: articleScheme,
  },
});

server.start().then((instance) => {
  function deploy() {
    return instance.inject({
      method: 'POST',
      url: 'http://localhost:6005/v1/surveys/article/deploy?key=test',
      payload: {
        deploy_time: deployTime.toDate(),
      },
    });
  }
  instance.inject({
    method: 'POST',
    url: 'http://localhost:6005/v1/surveys?key=test',
    payload: {
      name: 'article',
      scheme: 'article',
      question: 'Was this article worth your time?',
    },
  }).then(deploy, deploy);
});
