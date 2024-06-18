const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const viewRouter = express.Router();

// viewRouter.get('/', (req, res) => {
//   res.status(200).render('base', {
//     tour: 'The Forest Hiker',
//     user: 'Kseniia'
//   });
// });
// Global middleware the applies to all routes
// viewRouter.use(authController.isLoggedIn);
viewRouter.get('/', bookingController.createBookingChackout, authController.isLoggedIn, viewController.getOverview);
viewRouter.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
viewRouter.get('/login', authController.isLoggedIn, viewController.getLoginForm);
viewRouter.get('/me', authController.protect, viewController.getAccount);
viewRouter.get('/my-tours', authController.protect, viewController.getMyTours);

viewRouter.post('/submit-user-data', authController.protect, viewController.updateUserData);

module.exports = viewRouter;