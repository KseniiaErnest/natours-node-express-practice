const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

// Middleware for Router
const userRouter = express.Router();


// USER Routes
userRouter.post('/signup', authController.signup);
userRouter.post('/login', authController.login);

userRouter.post('/forgotPassword', authController.forgotPassword);
userRouter.patch('/resetPassword/:token', authController.resetPassword);

userRouter.patch('/updateMyPassword', authController.protect, authController.updatePassword);

userRouter.patch('/updateMe', authController.protect, userController.updateMe);
userRouter.delete('/deleteMe', authController.protect, userController.deleteMe);

userRouter.route('/').get(userController.getAllUsers).post(userController.createUser);
userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);



  module.exports = userRouter;