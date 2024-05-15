const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = id => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
}

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id)

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  })
});

exports.login = catchAsync(async (req, res, next) => {
  const {email, password} = req.body;

  // Check email and password exist;
  if (!email || !password) {
return next(new AppError('Please provide email and password', 400));
  }

  // Check if the user exists && password correct
const user = await User.findOne({email: email}).select('+password');

if (!user || !await user.correctPassword(password, user.password)) {
  return next(new AppError('Incorrect email or passsword', 401));
}
  // If everithing is okay, send token back to client
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token
  })
});

exports.protect = catchAsync(async (req, res, next) => {
  console.log('Protect middleware triggered');
// 1) Getting a token and check if it exists
let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Token:', token);
  }

  if (!token) {
    console.log('No token found'); // Log if token is missing
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }
// 2) Verification token
const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
console.log(decoded);

// 3) If verification is successful, check if user still exists
const currentUser = await User.findById(decoded.id);
if (!currentUser) {
  return next(new AppError('The user belongign to this token does not exist.', 401));
}
// 4) If user changed password after the token was issued
if (currentUser.changedPasswordAfter(decoded.iat)){
  return next(new AppError('User recently changed password! Please log in again.', 401));
};

// GRAND ACCESS T PROTECTED ROUTE
req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin, 'lead-guide']. Role = 'user

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission tp perfom this action', 403))
    } 

    next();
  }
}