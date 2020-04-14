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

const allowedOrigins = ['http://localhost:3001'];
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

  res.on('finish', async () => {
    const durationInMilliseconds = getDurationInMilliseconds(start);
    const currentLogs = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: durationInMilliseconds.toLocaleString(),
    };
    const reqLogs =
      'INSERT INTO req_logs(req_id, req_method, url,res_code,res_duration) VALUES ($1, $2, $3,$4,$5) returning id';
    const { rows } = await db.query(reqLogs, [
      req.requestId,
      req.method,
      req.originalUrl,
      res.statusCode,
      durationInMilliseconds.toLocaleString(),
    ]);

    if (!rows[0].id) {
      return next(
        new ErrorHandler(500, 'An error occured while saving the user')
      );
    }
  });

  res.on('close', () => {
    const durationInMilliseconds = getDurationInMilliseconds(start);
    // console.log(
    //   `${req.method} ${
    //     req.originalUrl
    //   } [CLOSED] ${durationInMilliseconds.toLocaleString()} ms`
    // );
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
