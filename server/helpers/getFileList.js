const url = require('url');

function getFileList (req) {
  return url.format({
    protocol: req.protocol,
    host: req.get('host'),
    pathname: '/getFileList',
  });
};

module.exports = getFileList
