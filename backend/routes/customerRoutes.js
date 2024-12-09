const express = require('express');
const router = express.Router();
const { executeSetCustAccount, executeSetCustUser, executeGetCustAccountInfo } = require('../controllers/customerController');

// Route to handle set_cust_account
router.post('/setCustAccount', executeSetCustAccount);

// Route to handle set_cust_user
router.post('/setCustUser', executeSetCustUser);

router.get('/getCustAccountinfo', executeGetCustAccountInfo);

module.exports = router;