const express = require('express');
const xml2js = require('xml2js');
const debug = require('debug')('my-covid19-api:debug');

const covid19 = require('../common/estimator.js');
const db = require('../dbQuery.js');
const fs = require('fs');

const router = express.Router();

router.post('/api/v1/on-covid-19', async (req, res, next) => {
  if (req.body.data) {
    try {
      const data = await covid19.estimator(req.body.data);
      res.status(200);
      res.json({
        ...data,
      });
    } catch (error) {
      debug(error);
      next(error);
    }
  } else {
    res.status(400);
    res.json({
      msg: 'no data to process',
    });
  }
});

router.post('/api/v1/on-covid-19/json', async (req, res, next) => {
  if (req.body.data) {
    try {
      const data = await covid19.estimator(req.body.data);
      debug('data', data);
      res.status(200);
      res.json({
        ...data,
      });
    } catch (error) {
      debug(error);
      next(error);
    }
  } else {
    res.status(400);
    res.json({
      msg: 'no data to process',
    });
  }
});

router.post('/api/v1/on-covid-19/xml', async (req, res, next) => {
  if (req.body.data) {
    try {
      const data = await covid19.estimator(req.body.data);
      const builder = new xml2js.Builder();
      const xml = builder.buildObject(data);
      res.status(200);
      res.set('Content-Type', 'text/xml');
      res.send(xml);
    } catch (error) {
      debug(error);
      next(error);
    }
  } else {
    res.status(400);
    res.json({
      msg: 'no data to process',
    });
  }
});

router.get('/api/v1/on-covid-19/logs', async (req, res, next) => {
  try {
    const sql = 'SELECT req_method, url,res_code,res_duration from req_logs';
    const { rows } = await db.query(sql);

    if (rows) {
      let resStr = '';
      rows.forEach((row) => {
        if (resStr === '') {
          resStr =
            resStr +
            `${row.req_method}  ${row.url}  ${row.res_code} ${row.res_duration}ms`;
        } else {
          resStr =
            resStr +
            `\n${row.req_method}  ${row.url}  ${row.res_code} ${row.res_duration}ms`;
        }
      });
      res.status(200);
      res.set('Content-Type', 'text/plain');

      res.send(resStr);
    } else {
      res.status(404);
      res.json({
        status: 'success',
        msg: 'no logs found',
      });
    }
  } catch (error) {
    debug(error);
    next(error);
  }
});

module.exports = router;
