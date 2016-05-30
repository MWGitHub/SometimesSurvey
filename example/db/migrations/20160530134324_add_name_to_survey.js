/* eslint-disable */
const co = require('co');

exports.up = function(knex, Promise) {
  return knex.schema.table('surveys', table => {
    return co(function* () {
      table.string('name').index().unique();

      yield knex.raw(`
        UPDATE
          surveys
        SET
          name=id
      `);

      yield knex.raw(`
        ALTER TABLE
          surveys
        ADD UNIQUE
          (name)
      `);
    });

  });

};

exports.down = function(knex, Promise) {
  return knex.schema.table('surveys', table => {
    table.dropColumn('name');
  });
};
