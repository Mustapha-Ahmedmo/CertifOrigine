const express = require('express');
const router = express.Router();
const { executeSetCustAccount, executeSetCustUser, executeGetCustAccountInfo, updateCustAccountStatus, rejectCustAccount, executeAddSubscription, executeCreateSubscriptionWithFile, executeGetCustAccountFiles } = require('../controllers/customerController');
const upload = require('../src/middleware/upload');

// Route to handle set_cust_account
router.post('/setCustAccount', executeSetCustAccount);

// Route to handle set_cust_user
router.post('/setCustUser', executeSetCustUser);

router.put('/rejectCustAccount/:id', rejectCustAccount);

router.get('/getCustAccountinfo', executeGetCustAccountInfo);

router.put('/update-status/:id', updateCustAccountStatus);

router.post('/add-subscription', executeAddSubscription);

router.post(
    '/add-subscription-with-file',
    upload.fields([
      { name: 'licenseFile', maxCount: 1 },
      { name: 'patenteFile', maxCount: 1 },
      { name: 'rchFile', maxCount: 1 },
    ]),
    executeCreateSubscriptionWithFile
  );

  // New route for fetching customer account files
router.get('/get-files', executeGetCustAccountFiles);
  
module.exports = router;