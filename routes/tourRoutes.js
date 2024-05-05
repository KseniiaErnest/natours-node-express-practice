const express = require('express');
const tourController = require('./../controllers/tourController');
// Middleware for Router
const tourRouter = express.Router();
// Param middleware; do not need anymore
// tourRouter.param('id', tourController.checkId);

// Check body middleware;


// / TOURS routes
tourRouter.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours)
tourRouter.route('/').get(tourController.getAllTours).post(tourController.createTour);
tourRouter
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

  module.exports = tourRouter;