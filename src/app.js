'use strict';
const { token } = require('gen-uid');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes/index');
const fs = require('fs');
//const flogs = require('./finish');
const debug = require('debug')('my-covid19-api:debug');
const db = require('./dbQuery.js');

const app = express();

const getDurationInMilliseconds = (start) => {
  const NS_PER_SEC = 1e9;
  const NS_TO_MS = 1e6;
  const diff = process.hrtime(start);

  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};

const allowedOrigins = [
  'http://localhost:3001',
  'https://my-covid19.herokuapp.com',
];
app.use(
  cors({
    origin(origin, callback) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          'The CORS policy for this site does not ' +
          'allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.use(async (req, res, next) => {
  req.requestId = token(true).substr(0, 8);
  const start = process.hrtime();
  let req_data = '';
  if (req.body) {
    req_data = req.body;
  }
  const reqLogs =
    'INSERT INTO req_logs(req_id, req_method, url,req_body) VALUES ($1, $2, $3,$4) returning id';
  const { rows } = await db.query(reqLogs, [
    req.requestId,
    req.method,
    req.originalUrl,
    req_data,
  ]);

  if (!rows[0].id) {
    return next(new Error(500, 'An error occured while saving logs'));
  }

  res.on('finish', async () => {
    const durationInMilliseconds = getDurationInMilliseconds(start);
    const updateLogs =
      'UPDATE req_logs SET res_duration=$1,res_code=$2 WHERE req_id=$3 returning id';
    const { rows } = await db.query(updateLogs, [
      durationInMilliseconds.toLocaleString(),
      res.statusCode,
      req.requestId,
    ]);

    if (!rows[0].id) {
      return next(new Error(500, 'An error occured while updating the logs'));
    }
  });

  res.on('close', async () => {
    const durationInMilliseconds = getDurationInMilliseconds(start);
    const updateLogs =
      'UPDATE req_logs SET res_close=$1,status=$2 WHERE req_id=$3 returning id';
    const { rows } = await db.query(updateLogs, [
      durationInMilliseconds.toLocaleString(),
      1,
      req.requestId,
    ]);

    if (!rows[0].id) {
      return next(new Error(500, 'An error occured while updating the logs'));
    }
  });

  next();
});

app.use('/', routes);

app.use((req, res, next) => {
  res.status(404);
  res.json({
    status: 'error',
    error: 'Route not found',
  });
});

module.exports = app;
