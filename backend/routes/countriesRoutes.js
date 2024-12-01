const express = require('express');
const { getCountryInfo } = require('../controllers/countriesController');
const router = express.Router();

// Route to fetch country info
router.get('/', getCountryInfo);

module.exports = router;