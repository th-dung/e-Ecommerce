const express = require('express');
const app = express();
require('dotenv').config();
const morgan = require('morgan');
const {default: helmet} = require('helmet');
const compression = require('compression');

// get data form
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());

// init middlewares

// init db
require('./dbs/init.mongodb');
// const {checkOverLoad} = require('./helpers/check.connect');
// checkOverLoad();

// init routes
app.use('/', require('./routes/index.route')); 

// handling error
app.use((req, res, next) => {
      const error = new Error('Not Found');
      error.status = 404;
      next(error);
});

app.use((error, req, res, next) => {
      const statusCode = error.status || 500
      return res.status(statusCode).json({
            status: 'error',
            stack: error.stack,
            code: statusCode,
            message: error.message || 'Internal Server Error!'
      });
});

module.exports = app;