const express = require('express');
let router = express.Router();
let upload = require('./upload')
let getFileList = require('./getFileList')
let getFile = require('./getFile')
let deleteFile = require('./deleteFile')

router.get('/', (req, res) => {
  res.send({msg: 'server working'})
});
router.use('/upload', upload);
router.use('/getFileList', getFileList);
router.use('/getFile', getFile);
router.use('/deleteFile', deleteFile);

module.exports = router;
