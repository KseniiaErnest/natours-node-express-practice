const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('./../models/userModel');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
const tours = await Tour.find();
  // 2) Build template

  // 3) Render the tamplete using the tour data from step 1
  res.status(200).render('overview', {
    title: 'All Tours',
    tours: tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
// 1) Get the data, for the requested tour (including reviews and guides)
const tour = await Tour.findOne({ slug: req.params.slug }).populate({
  path: 'reviews',
  fields: 'review rating user'
});

if (!tour) {
  return next(new AppError('There is no tour with that name', 404));
}

// 2) Build template

// 3) Render the tamplete ussing the data from step 1
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour: tour
  });
});


exports.getLoginForm = (req, res) => {
res.status(200).render('login', {
title: 'Log into your account'
});
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
}

exports.updateUserData = catchAsync(async (req, res, next) => {
const updatedUser = await User.findByIdAndUpdate(req.user.id, {
  name: req.body.name,
  email: req.body.email
},
{
  new: true,
  runValidators: true
});

res.status(200).render('account', {
  title: 'Your account',
  user: updatedUser
})
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({user: req.user.id})

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: touIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  })
});

exports.createBooking = factory.createOne(Booking)
exports.getBooking = factory.getOne(Booking)
exports.getAllBookings = factory.getAll(Booking)
exports.updateBooking = factory.updateOne(Booking)
exports.deleteBooking = factory.deleteOne(Booking)



