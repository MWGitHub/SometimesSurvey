module.exports = {
  test: {
    client: 'pg',
    connection: {
      host: process.env.pg_host,
      user: process.env.pg_user,
      database: 'sometimes_survey_test',
    },
    seeds: {
      directory: './db/seeds',
    },
    migrations: {
      directory: './db/migrations',
    },
    pool: {
      min: 1,
      max: 2,
    },
  },

  development: {
    client: 'pg',
    connection: {
      host: process.env.pg_host,
      user: process.env.pg_user,
      database: 'sometimes_survey_dev',
    },
    seeds: {
      directory: './db/seeds',
    },
    migrations: {
      directory: './db/migrations',
    },
    pool: {
      min: 1,
      max: 2,
    },
  },

  production: {
    client: 'pg',
    connection: {
      host: process.env.pg_host,
      user: process.env.pg_user,
      database: 'sometimes_survey',
    },
    seeds: {
      directory: './db/seeds',
    },
    migrations: {
      directory: './db/migrations',
    },
    pool: {
      min: 1,
      max: 2,
    },
  },
};
