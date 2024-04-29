const express = require('express');
const app = express();
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
};

app.use(express.json());
// static
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('Hello from Middleware!');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

  // We use the middleware for Router
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
