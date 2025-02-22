const express = require('express');
const upload = require('../src/middleware/upload'); // Use your existing multer middleware
const { executeAddOrder, getTransmodeInfo, getUnitWeightInfo, getRecipientInfo, setRecipientAccount, executeAddCertifOrder, addOrUpdateCertifGood, getOrdersForCustomer, getCertifGoodsInfo, getCertifTranspMode, setOrdCertifTranspMode, cancelOrder, renameOrder, updateCertif, getFilesRepoTypeofInfo, setOrderFiles, delOrderFiles, getOrderFilesInfoController, getOrderOpInfoController, setUnitWeight, deleteUnitWeight, submitOrder, remOrdCertifGoods, remOrdCertifTranspMode, remSingleOrdCertifTranspMode } = require('../controllers/OrderController');

const router = express.Router();
router.post('/create', executeAddOrder);
router.post("/create-certif", executeAddCertifOrder);
// Route to fetch transport mode information
router.get('/transport-modes', getTransmodeInfo);

// Route to fetch unit weight information
router.get('/unit-weights', getUnitWeightInfo);

router.post('/certif-goods', addOrUpdateCertifGood);
router.get('/certif-goods', getCertifGoodsInfo);

router.get('/recipients', getRecipientInfo);
router.post('/recipients', setRecipientAccount);

router.get('/customer-orders', getOrdersForCustomer);

router.get('/certif-transp-mode', getCertifTranspMode);

router.post('/cancel', cancelOrder);

router.post('/certif-transpmode', setOrdCertifTranspMode);

router.post('/rename', renameOrder);

router.post('/update-certif', updateCertif);

router.get('/files-repo-typeof', getFilesRepoTypeofInfo);

//router.post('/order-files', upload.single('file'), setOrderFiles);
router.post('/order-files', (req, res, next) => {
    console.log('Before Multer:', req.body);
    next();
  }, 
  upload.single('file'),
  (req, res, next) => {
    console.log('After Multer:', req.body);
    next();
  },
  setOrderFiles);
router.post('/order-files/delete', delOrderFiles); // New: Delete order files

router.get('/order-files-info', getOrderFilesInfoController);

router.get('/op-info', getOrderOpInfoController);

router.post('/unit-weight', setUnitWeight);
router.post('/unit-weight/delete', deleteUnitWeight);

router.post('/submit-order', submitOrder);


router.post('/certif-goods/delete', remOrdCertifGoods);
router.post('/certif-transpmode/delete', remOrdCertifTranspMode);
router.post('/certif-transpmode/delete-single', remSingleOrdCertifTranspMode);


module.exports = router;