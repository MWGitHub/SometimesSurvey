const test = require('tape');
const database = require('../lib/database');


test('database connection test', t => {
  database.connect();
  t.pass('successfully connected');
  database.close();

  t.end();
});
