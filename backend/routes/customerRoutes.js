const express = require('express');
const router = express.Router();
const { executeSetCustAccount, executeSetCustUser, executeSetCustSmallUser, executeGetCustAccountInfo, updateCustAccountStatus, rejectCustAccount, executeAddSubscription, executeCreateSubscriptionWithFile, executeGetCustAccountFiles, requestPasswordReset, executeResetPassword, executeGetCustUsersByAccount, executeDeleteCustUser, handleContactForm, executeUpdCustAccount, executeDelCustAccountFiles, disableCustAccount, reactivateCustAccount, executeReactivateCustUser, sendCustomEmail, addCustAccountFile } = require('../controllers/customerController');
const upload = require('../src/middleware/upload');

// Route to handle set_cust_account
router.post('/setCustAccount', executeSetCustAccount);

// Route to handle set_cust_user
router.post('/setCustUser', executeSetCustUser);


router.post('/setCustSmallUser', executeSetCustSmallUser);

router.put('/rejectCustAccount/:id', rejectCustAccount);

router.get('/getCustAccountinfo', executeGetCustAccountInfo);

router.put('/update-status/:id', updateCustAccountStatus);

router.post('/add-subscription', executeAddSubscription);

router.get('/get-cust-users', executeGetCustUsersByAccount);

router.put('/delete-cust-user/:id', executeDeleteCustUser);

router.post('/contact', handleContactForm);

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

// Password reset routes
router.post('/password-reset/request', requestPasswordReset);
router.post('/password-reset/reset', executeResetPassword);

router.post('/upd-cust-account', executeUpdCustAccount);

router.delete('/delete-cust-account-file/:id', executeDelCustAccountFiles);

router.put('/disable-cust-account/:id', disableCustAccount);

router.put('/reactivate-cust-account/:id', reactivateCustAccount);

router.patch('/reactivate-cust-user/:id', executeReactivateCustUser);

router.post('/send-custom-email', sendCustomEmail);

router.post('/add-cust-account-file', upload.single('file'), addCustAccountFile);

module.exports = router;