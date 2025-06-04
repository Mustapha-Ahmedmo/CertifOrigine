const express = require('express');
const { setMemo, getMemo, ackMemoCust } = require('../controllers/mailerController');
const router = express.Router();

router.post('/set_memo', setMemo);
router.get('/get_memo', getMemo);
router.post('/ack_memo_cust', ackMemoCust);

module.exports = router;