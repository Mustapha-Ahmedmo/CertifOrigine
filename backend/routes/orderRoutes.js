const express = require('express');
const { executeAddOrder, getTransmodeInfo, getUnitWeightInfo, getRecipientInfo, setRecipientAccount, executeAddCertifOrder, addOrUpdateCertifGood, getOrdersForCustomer, getCertifGoodsInfo, getCertifTranspMode, setOrdCertifTranspMode, cancelOrder } = require('../controllers/OrderController');

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

module.exports = router;