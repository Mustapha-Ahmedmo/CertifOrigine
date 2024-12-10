const express = require('express');
const router = express.Router();
const { executeSetCustAccount, executeSetCustUser, executeGetCustAccountInfo, updateCustAccountStatus } = require('../controllers/customerController');

// Route to handle set_cust_account
router.post('/setCustAccount', executeSetCustAccount);

// Route to handle set_cust_user
router.post('/setCustUser', executeSetCustUser);

router.get('/getCustAccountinfo', executeGetCustAccountInfo);


// Nouvelle Route pour mettre à jour le statut_flag
router.put('/update-status/:id', updateCustAccountStatus);

module.exports = router;