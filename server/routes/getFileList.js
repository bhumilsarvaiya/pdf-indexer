const express = require('express');
let router = express.Router();
const debug = require('debug')('/getFileList');
const fs = require('fs');

router.get('/', async (req, res) => {
  try {
    let mainFilePath = process.cwd();
    let dir = mainFilePath +'/public';
    if (!fs.existsSync(dir)) {
      res.send([])
    }
    let fileList = await fs.readdirSync(dir)
    dataToSend = []
    for (let i in fileList) {
      fileStat = await fs.statSync(dir + '/' + fileList[i])
      dataToSend.push({fileName: fileList[i], created_at: fileStat.ctime, id: fileStat.ino})
    }
    res.send(dataToSend);
  } catch (err) {
    debug('Error:', err);
    res.status(500).send(err);
  }
});

module.exports = router;
