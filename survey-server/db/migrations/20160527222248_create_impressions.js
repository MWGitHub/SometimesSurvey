/* eslint-disable */
exports.up = function(knex, Promise) {
  knex.schema.createTable('impressions', function (table) {
    table.increments();
    table.integer('item_id').index();
    table.timestamps();
  });
};

exports.down = function(knex, Promise) {
  knex.schema.dropTable('impressions');
};
