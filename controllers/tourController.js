const fs = require('fs');
const Tour = require('./../models/tourModel');


// For testing:
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// Param middleware; we do not need it anymore as we work with Mongoose
// exports.checkId = (req, res, next, val) => {
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }

//   next();
// };

// Check body middleware; we do not need it anymore as we work with Mongoose
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price'
//     })
//   };

//   next();
// }

exports.getAllTours = async (req, res) => {
  
  try {
   const tours = await Tour.find();

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch(err) {
res.status(404).json({
  status: 'fail',
  message: err
})
  }

};

// GET ONE request
exports.getTour = async (req, res) => {
   try {
const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
   } catch(err) {
res.status(404).json({
  status: 'fail',
  message: err
})
   }
};

// POST request
exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
res.status(400).json({
  status: 'fail',
  message: err
})
  }
    };

// PUTCH request
exports.updateTour = async (req, res) => {
  try {
const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
  new: true,
  runValidators: true
});

    res.status(200).json({
      status: 'success',
      data: {
        tour: tour
      },
    });
  } catch(err) {
res.status(400).json({
  status: 'fail',
  message: err
})
  }
};

// DELETE request
exports.deleteTour = async (req, res) => {
  try {

   await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch(err) {
    res.status(400).json({
      status: 'fail',
      message: err
    })
  }
 
};
