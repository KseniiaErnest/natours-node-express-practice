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
    // Build query
    // 1) Filtering
    const queryObj = {...req.query} // hard copy
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Advanced filtering
     // {difficulty: 'easy', duration: {$gte: 5}}
   // { difficulty: 'easy', duration: { gte: '5' } }
   // what we want to be replaced gte, gt, lte, lt
    let queryStr = JSON.stringify(queryObj);
   queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

   let query = Tour.find(JSON.parse(queryStr));

   // 2) Sorting
if (req.query.sort) {
  const sortBy = req.query.sort.split(',').join(' ');
  console.log(sortBy);
query = query.sort(sortBy);
} else {
  query = query.sort('-createdAt');
}

// 3) Field limiting
if (req.query.fields) {
  const fields = req.query.fields.split(',').join(' ');
  query = query.select(fields);
} else {
  query = query.select('-__v');
}


   // Execute query
   const tours = await query;

// Send response
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
