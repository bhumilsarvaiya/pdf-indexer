const express = require('express');
let router = express.Router();
const r = require('../db/rethinkdb');
const request = require('request-promise');
const DB_NAME = process.env.db || 'PDF_Extract'; //DB used to store uploaded file names
const TABLE_NAME = process.env.table || 'pdflist'; //Table used to store uploaded file names
const debug = require('debug')('/upload');
const _ = require('lodash');
let getFileList = require('../helpers/getFileList')
var fs = require('fs');

router.post('/', async (req, res) => {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.file;
  debug('filename:/public/' + sampleFile.name)
  // Use the mv() method to place the file somewhere on your server
  try {
    let fileList = await request(getFileList(req))
    fileList = JSON.parse(fileList)
    if (_.findIndex(fileList, {fileName: sampleFile.name}) !== -1) {
      res.status(400).send(sampleFile.name + ' aleady exists');
    } else {
      
      let mainFilePath = process.cwd();
      let dir = mainFilePath +'/public';
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
      await sampleFile.mv(mainFilePath + '/public/' + sampleFile.name)
      await r.db(DB_NAME).table(TABLE_NAME).insert({'fileName': sampleFile.name, 'created_at': new Date().toJSON()}).run()
      res.send('File uploaded!');
    }
  } catch (err) {
    debug('Error:', err)
    res.status(500).send(err)
  }
});

module.exports = router;
