const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./reviewRoutes');
// Middleware for Router
const tourRouter = express.Router();
// Param middleware; do not need anymore
// tourRouter.param('id', tourController.checkId);

// Check body middleware;

tourRouter.use('/:tourId/reviews', reviewRouter);

// / TOURS routes

tourRouter
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

tourRouter.route('/tour-stats').get(tourController.getTourStats);
tourRouter.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

tourRouter
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);
tourRouter
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

// POST /tour/id569494/reviews
// GET /tour/id59495/reviews/id984834
// tourRouter
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

module.exports = tourRouter;
