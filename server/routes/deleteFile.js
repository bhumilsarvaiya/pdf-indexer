const express = require('express');
let router = express.Router();
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser')

app.use(bodyParser.json());

router.get('/', async (req, res) => {
  try {
    let mainFilePath = process.cwd();
    let dir = mainFilePath +'/public/'+ req.query.filename;
    await fs.unlinkSync(dir);
    res.send(result);
  } catch (err) {
    // debug('Error:', err);
    res.status(500).send(err);
  }
});

module.exports = router;
