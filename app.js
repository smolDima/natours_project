const path = require('path');
const express = require('express');
const morgan = require('morgan');
// eslint-disable-next-line import/no-extraneous-dependencies
const rateLimit = require('express-rate-limit');
// eslint-disable-next-line import/no-extraneous-dependencies
const helmet = require('helmet');
// eslint-disable-next-line import/no-extraneous-dependencies
const mongoSanitize = require('express-mongo-sanitize');
// eslint-disable-next-line import/no-extraneous-dependencies
const xss = require('xss-clean');
// eslint-disable-next-line import/no-extraneous-dependencies
const hpp = require('hpp');
// eslint-disable-next-line import/no-extraneous-dependencies
const cookieParser = require('cookie-parser');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRouters');
const bookingRouter = require('./routes/bookingRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// Start express app
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Global Middleware

// Serving static files
app.use(express.static(path.join(__dirname, 'public'))); //how to serving to the static files

// Set security HTTP heders
app.use(helmet());
//app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://js.stripe.com;",
  );
  next();
});

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same IP (error: Too many requests from this IP, please try again in an hour!)
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(
  express.json({
    limit: '10kb',
  }),
);
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data Data Sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

//Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

// Routes

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
