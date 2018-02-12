const express = require('express');
let router = express.Router();
var app = express();
const r = require('../db/rethinkdb');
const DB_NAME = process.env.db || 'PDF_Extract'; //DB used to store uploaded file names
const TABLE_NAME = process.env.table || 'pdflist'; //Table used to store uploaded file names
var fs = require('fs');
var bodyParser = require('body-parser')

app.use(bodyParser.json());

router.get('/', async (req, res) => {
  try {
    let mainFilePath = process.cwd();
    let dir = mainFilePath +'/public/'+ req.query.filename;
    await fs.unlinkSync(dir);
    let result = await r.db(DB_NAME).table(TABLE_NAME).get(req.query.id).delete().run();
    res.send(result);
  } catch (err) {
    // debug('Error:', err);
    res.status(500).send(err);
  }
});

module.exports = router;