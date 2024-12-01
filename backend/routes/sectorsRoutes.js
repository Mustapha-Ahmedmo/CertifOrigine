const express = require('express');
const { getSectorInfo } = require('../controllers/sectorsController');
const router = express.Router();

// Route to fetch sector info
router.get('/', getSectorInfo);

module.exports = router;