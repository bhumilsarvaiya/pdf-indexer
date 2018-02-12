const debug = require('debug')('server-rethinkdb')
const _ = require('lodash')

const DB_NAME = process.env.db || 'PDF_Extract' //DB used to store uploaded file names
const TABLE_NAME = process.env.table || 'pdflist' //Table used to store uploaded file names

//connection options for rethinkdb
let cxnOptions = {
  host: process.env.db_host || 'localhost',
  port: process.env.db_port || 28015,
}

const r = require('rethinkdbdash')(cxnOptions);
init();

async function init () {
  //will create db 'DB_NAME' if not already exists
  await createDB();
  //will create table 'TABLE_NAME' is not already exists
  await createTable();
}

async function createDB () {
  let dbList = await r.dbList().run();
  if (_.includes(dbList, DB_NAME)) {
    debug('db ' + DB_NAME + ' exists');
  } else {
    await r.dbCreate(DB_NAME).run()
    debug('db ' + DB_NAME + ' created');
  }
}

async function createTable () {
  let tableList = await r.db(DB_NAME).tableList().run();
  if (_.includes(tableList, TABLE_NAME)) {
    debug('table ' + TABLE_NAME + ' exists');
  } else {
    await r.db(DB_NAME).tableCreate(TABLE_NAME).run()
    debug('table ' + TABLE_NAME + ' created');
  }
}

module.exports = r;
