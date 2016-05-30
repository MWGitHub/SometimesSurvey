const Server = require('survey-server').Server;

const server = new Server({
  port: 6001,
  key: 'test',
});

server.start();
