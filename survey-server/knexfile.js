module.exports = {
  test: {
    client: 'pg',
    connection: {
      host: process.env.pg_host,
      user: process.env.pg_user,
      database: 'sometimes_survey_test',
    },
    migrations: {
      directory: './db/migrations',
    },
  },

  development: {
    client: 'pg',
    connection: {
      host: process.env.pg_host,
      user: process.env.pg_user,
      database: 'sometimes_survey_dev',
    },
    migrations: {
      directory: './db/migrations',
    },
  },

  production: {
    client: 'pg',
    connection: {
      host: process.env.pg_host,
      user: process.env.pg_user,
      database: 'sometimes_survey',
    },
    migrations: {
      directory: './db/migrations',
    },
  },
};
