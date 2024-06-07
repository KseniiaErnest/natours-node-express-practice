const express = require('express');
const multer = require('multer');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const upload = multer({ dest: 'public/img/users'});

// Middleware for Router
const userRouter = express.Router();


// USER Routes
userRouter.post('/signup', authController.signup);
userRouter.post('/login', authController.login);
userRouter.get('/logout', authController.logout);

userRouter.post('/forgotPassword', authController.forgotPassword);
userRouter.patch('/resetPassword/:token', authController.resetPassword);

// Protect all the routes after this middleware - that's because middleware runs in sequence.
userRouter.use(authController.protect);

userRouter.patch('/updateMyPassword', authController.updatePassword);

userRouter.get('/me', userController.getMe, userController.getUser);
userRouter.patch('/updateMe', upload.single('photo'), userController.updateMe);
userRouter.delete('/deleteMe', userController.deleteMe);

// Only admins have access to below routes + protected
userRouter.use(authController.restrictTo('admin'))
userRouter.route('/').get(userController.getAllUsers).post(userController.createUser);
userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);



  module.exports = userRouter;