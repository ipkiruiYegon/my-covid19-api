require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.database,
});

module.exports = {
  query(text, params) {
    return new Promise((resolve, reject) => {
      pool
        .query(text, params)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};
