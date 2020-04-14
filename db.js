require('dotenv').config();

const { Pool } = require('pg');

const debug = require('debug')('my-covid19-api:debug');

const pool = new Pool({
  connectionString: process.env.database,
});

debug(
  `current database connection- ${process.env.database} and in ${process.env.name} mode`
);

const dropTables = () => {
  const dropDbTables = 'DROP TABLE IF EXISTS req_logs';
  pool
    .query(dropDbTables)
    .then((res) => {
      debug(res);
      pool.end();
    })
    .catch((err) => {
      debug(err);
      pool.end();
    });
};

const createTables = () => {
  const dbTables = `CREATE TABLE IF NOT EXISTS req_logs(id SERIAL PRIMARY KEY,req_id VARCHAR NOT NULL,req_method VARCHAR,url VARCHAR,res_code VARCHAR,res_duration VARCHAR,res_close VARCHAR)`;

  pool
    .query(dbTables)
    .then((res) => {
      debug(res);
      pool.end();
    })
    .catch((err) => {
      debug(err);
      pool.end();
    });
};

module.exports = {
  createTables,
  pool,
  dropTables,
};

require('make-runnable');
