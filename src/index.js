require('dotenv').config();

const debug = require('debug')('my-covid19-api:debug');

const app = require('./app');

debug(process.env.port);
const port = process.env.PORT || 80;

const listen = app.listen(port, () => {
  debug(
    `server is running on port ${process.env.port} and in ${process.env.name} mode`
  );
});
module.exports = app;
module.exports.port = listen.address().port;
