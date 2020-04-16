const express = require('express');
const xml2js = require('xml2js');
const debug = require('debug')('my-covid19-api:debug');

const covid19 = require('../common/estimator.js');
const db = require('../dbQuery.js');
const fs = require('fs');

const router = express.Router();

router.post('/api/v1/on-covid-19', async (req, res, next) => {
  if (req.body) {
    try {
      // const reqData = req.body;
      const data = await covid19.estimator(req.body);
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
  if (req.body) {
    try {
      const data = await covid19.estimator(req.body);
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
  if (req.body) {
    try {
      const data = await covid19.estimator(req.body);
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
    const sql =
      'SELECT req_method, url,res_code,res_duration from req_logs WHERE status=$1';
    const { rows } = await db.query(sql, [1]);

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

router.get('/api/v1/on-covid-19/admin/logs', async (req, res, next) => {
  try {
    const sql = 'SELECT * from req_logs';
    const { rows } = await db.query(sql);

    if (rows) {
      res.status(200);
      res.json({
        status: 'success',
        logs: rows,
      });
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
