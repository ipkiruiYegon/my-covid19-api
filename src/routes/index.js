const express = require('express');

const router = express.Router();

const appRoutes = require('../routes/routes');

router.use(appRoutes);

module.exports = router;
