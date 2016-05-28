/* eslint-disable */
exports.up = function(knex, Promise) {
  knex.schema.createTable('conversions', function (table) {
    table.increments();
    table.integer('item_id').index();
    table.integer('box');
    table.timestamps();
  });
};

exports.down = function(knex, Promise) {
  knex.schema.dropTable('conversions');
};
