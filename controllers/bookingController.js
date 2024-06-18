const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('.//handlerFactory');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourID);

  // 2) Creat checkput session
  // const session = await stripe.checkout.sessions.create({
  //   payment_method_types: ['card'],
  //   success_url: `${req.protocol}://${req.get('host')}/`,
  //   cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
  //   customer_email: req.user.email,
  //   client_reference_id: req.params.tourID,
  //   line_items: [{
  //     name: `${tour.name} Tour`,
  //     description: tour.summary,
  //     images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
  //     amount: tour.price * 100,
  //     currency: 'usd',
  //     quantity: 1
  //   }]
  // })

  // Version 2024
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingChackout = catchAsync(async (req, res, next) => {
  // This is temp, because it is unsecure: everyone can book a tour without paying
  const {tour, user, price} = req.query;
  
  if(!tour && !user && !price) {
await Booking.create({tour, user, price});

res.redirect(req.originalUrl.split('?')[0])
  }
})
