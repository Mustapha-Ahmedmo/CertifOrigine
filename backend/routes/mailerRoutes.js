const express = require('express');
const { setMemo, getMemo, ackMemoCust, getMemoFilesInfo } = require('../controllers/mailerController');
const router = express.Router();

router.post('/set_memo', setMemo);
router.get('/get_memo', getMemo);
router.post('/ack_memo_cust', ackMemoCust);
router.get('/get_memo_files_info', getMemoFilesInfo);

router.get(
    '/download_memo/:year/:filename',
    (req, res) => {
      const { year, filename } = req.params;
      const filePath = path.resolve(
        __dirname,
        '../data/memos',
        year,
        filename
      );
      res
        .download(filePath, filename, err => {
          if (err) return res.status(404).send('Fichier introuvable');
        });
    }
  );
module.exports = router;