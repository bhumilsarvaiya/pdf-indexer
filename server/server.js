var express = require('express');
var bodyParser = require('body-parser')
var app = express();
const fileUpload = require('express-fileupload');
var cors = require('cors');
const _ = require('lodash')
let router = require('./routes')

app.use(bodyParser.json());
// use it before all route definitions
app.use(cors({origin: '*'}));
app.use(fileUpload())
app.use(express.static('public'))
app.use('/', router)

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})
