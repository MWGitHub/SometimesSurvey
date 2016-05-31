const Server = require('survey-server').Server;

const articles = require('survey-scheme-article').seed.articles;
const deployTime = require('survey-scheme-article').seed.deploy;
const articleScheme = require('survey-scheme-article').scheme(key =>
  Promise.resolve(articles[key])
);
const knexfile = require('./knexfile');
const co = require('co');

const server = new Server({
  port: 6005,
  key: 'test',
  databaseConfig: knexfile,
  schemes: {
    article: articleScheme,
  },
}, {
  routes: {
    cors: {
      credentials: true,
    },
  },
});

co(function* start() {
  const instance = yield server.start();

  // Deploy the survey if it has already been made
  yield instance.inject({
    method: 'POST',
    url: 'http://localhost:6005/v1/surveys/article/deploy?key=test',
    payload: {
      deploy_time: deployTime.toDate(),
    },
  });

  // Create the survey if it has not alreaby been made
  yield instance.inject({
    method: 'POST',
    url: 'http://localhost:6005/v1/surveys?key=test',
    payload: {
      name: 'article',
      scheme: 'article',
      question: 'Was this article worth your time?',
    },
  });
}).then();
