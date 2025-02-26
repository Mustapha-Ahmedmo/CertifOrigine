const express = require('express');
const { setMemo, getMemo } = require('../controllers/mailerController');
const router = express.Router();

router.post('/set_memo', setMemo);
router.get('/get_memo', getMemo);

module.exports = router;