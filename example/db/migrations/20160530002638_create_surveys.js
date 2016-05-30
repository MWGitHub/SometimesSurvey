/* eslint-disable */
exports.up = function(knex, Promise) {
  return knex.schema.createTable('surveys', function (table) {
    table.increments();
    table.string('scheme').notNullable();
    table.string('question');
    table.boolean('deployed').notNullable().defaultTo(false);
    table.dateTime('deploy_time')
    table.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('surveys');
};
