const express = require('express');
const router = express.Router();
const { executeSetCustAccount, executeSetCustUser, executeGetCustAccountInfo, updateCustAccountStatus, rejectCustAccount, executeAddSubscription } = require('../controllers/customerController');

// Route to handle set_cust_account
router.post('/setCustAccount', executeSetCustAccount);

// Route to handle set_cust_user
router.post('/setCustUser', executeSetCustUser);

router.put('/rejectCustAccount/:id', rejectCustAccount);

router.get('/getCustAccountinfo', executeGetCustAccountInfo);

router.put('/update-status/:id', updateCustAccountStatus);

router.post('/add-subscription', executeAddSubscription);

module.exports = router;