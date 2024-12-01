const express = require('express');
const router = express.Router();
const { executeSetCustAccount, executeSetCustUser } = require('../controllers/customerController');

// Route to handle set_cust_account
router.post('/setCustAccount', executeSetCustAccount);

// Route to handle set_cust_user
router.post('/setCustUser', executeSetCustUser);

module.exports = router;