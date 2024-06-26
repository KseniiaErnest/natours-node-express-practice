const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
// const sendEmail = require('./../utils/email');
const Email = require('./../utils/email');

const signToken = id => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

res.cookie('jwt', token, cookieOptions);

// Remove the password from output;
user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  })
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  const url = `${req.protocole}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();

  createAndSendToken(newUser, 201, res);
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
  createAndSendToken(user, 200, res);
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
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt
  }

  if (!token) {
    console.log('No token found'); // Log if token is missing
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
    // return res.redirect('/');
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

// GRAND ACCESS TO PROTECTED ROUTE
req.user = currentUser;
res.locals.user = currentUser;
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

exports.forgotPassword = catchAsync(async (req, res, next) => {
// 1) Get user based on POSTed email
const user = await User.findOne({ email: req.body.email })
if (!user) {
  return next(new AppError('There is not user with email address', 404));
}

// 2) Generate the random reset token
const resetToken = user.createPasswordResetToken();
await user.save({ validateBeforeSave: false });

// 3) Send it to user's email
const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you did not forget your password, please ignore this email! `

try {
  // await sendEmail({
  //   email: user.email,
  //   subject: 'Your password reset token. Valid for 10 minutes',
  //   message
  // });

  await new Email(user, resetURL).sendPasswordReset();
  
  res.status(200).json({
    status: 'success',
    message: 'Token sent to email!'
  })
} catch(err) {
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return next(new AppError('There was an error sending the email. Try again later!', 500));
}

});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on the token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}});

  // 2) if token has not expired, and there is a user, set new password
if (!user) {
  return next(new AppError('Token is invalid or has exprired', 400));
}
user.password = req.body.password;
user.passwordConfirm = req.body.password;
user.passwordResetToken = undefined;
user.passwordResetExpires = undefined;
await user.save();

  // 3) Update changedPasswordAt property for the user via userModel
  //4) Log the user in, send JWT
  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if posted password is correct
if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
return next(new AppError('Your current password is wrong', 404));
}
  // 3) If so, Update the password
user.password = req.body.password;
user.passwordConfirm = req.body.passwordConfirm;
await user.save();
// User.findByIdAndUpdate will NOT work as intented!


  // 4) Log user in, send JWT
  createAndSendToken(user, 200, res);
});


// Only for rendered pages, no errors
exports.isLoggedIn = async (req, res, next) => {
if (req.cookies.jwt) {
  try {
  // Verify the token
  const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

 // If verification is successful, check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
  return next();
  }

  //  If user changed password after the token was issued
if (currentUser.changedPasswordAfter(decoded.iat)){
  return next();
};

// There is a logged in user
res.locals.user = currentUser;
 return next();
  } catch(err) {
    return next();
  }
} 
  next();
};

// exports.logout = (req, res) => {
//   res.cookie('jwt', 'loggedout', {
//     expires: new Date(Date.now() + 10 * 1000),
//     httpOnly: true
//   });

//   res.status(200).json({success: 'success'});
// }

exports.logout = (req, res) => {
  res.clearCookie('jwt');
  res.status(200).json({ status: 'success' });
};