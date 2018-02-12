const express = require('express');
let router = express.Router();
const debug = require('debug')('/getFile');
const _ = require('lodash');
const request = require('request-promise');
let getFileList = require('../helpers/getFileList');
const fs = require('fs');

router.get('/:fileName', async (req, res) => {
  if (!req.params.fileName)
    return res.status(400).send('No files were uploaded.');

  try {
    let fileName = req.params.fileName
    let fileList = await request(getFileList(req))
    fileList = JSON.parse(fileList)
    if (_.findIndex(fileList, {fileName: fileName}) === -1) {
      res.status(400).send('No such file exists');
    } else {
      let mainFilePath = process.cwd();
      let filePath = mainFilePath + '/public/' + fileName;
      let file = fs.createReadStream(filePath);
      let stat = fs.statSync(filePath);
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Content-Type', 'application/pdf');
      // res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
      file.pipe(res);
    }
  } catch (err) {
    debug('Error:', err);
    res.status(500).send(err);
  }
});

router.get('/', async (req, res) => {
  res.status(400).send('Please specify the file');
});

module.exports = router;
