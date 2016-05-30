/* eslint-disable */
exports.up = function(knex, Promise) {
  return knex.schema.createTable('events', function (table) {
    table.increments();
    table.string('item_key').index().notNullable();
    table.uuid('fingerprint').index().notNullable();
    table.string('event').index().notNullable();
    table.jsonb('data');
    table.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('events');
};
