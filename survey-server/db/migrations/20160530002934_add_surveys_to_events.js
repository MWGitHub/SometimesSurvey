/* eslint-disable */
exports.up = function(knex, Promise) {
  return knex.schema.table('events', table => {
    table.integer('survey_id').notNullable().index().references('surveys.id');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('events', table => {
    table.dropColumn('survey_id');
  });
};
