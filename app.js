const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const index = require('./routes/index');
const ebooks = require('./routes/ebooks');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise
mongoose.connect(process.env.EBOOK_DATABASE)

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/ebooks', ebooks);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({mesage: err.message});
});

module.exports = app;
