const express = require('express');
let router = express.Router();
const r = require('../db/rethinkdb');
const DB_NAME = process.env.db || 'PDF_Extract'; //DB used to store uploaded file names
const TABLE_NAME = process.env.table || 'pdflist'; //Table used to store uploaded file names
const debug = require('debug')('/getFileList');

router.get('/', async (req, res) => {
  try {
    let result = await r.db(DB_NAME).table(TABLE_NAME).orderBy('created_at').run();
    res.send(result);
  } catch (err) {
    debug('Error:', err);
    res.status(500).send(err);
  }
});

module.exports = router;
