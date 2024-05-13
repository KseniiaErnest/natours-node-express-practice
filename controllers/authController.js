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
    passwordConfirm: req.body.passwordConfirm
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