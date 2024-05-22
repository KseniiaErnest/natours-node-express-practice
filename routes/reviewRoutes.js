const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

// Middleware for Router
const reviewRouter = express.Router({ mergeParams: true });

// Review routes
reviewRouter
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

module.exports = reviewRouter;
