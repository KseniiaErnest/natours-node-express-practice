const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then((con) => {
  console.log(con.connection);
  console.log('DB connection successfull!');
});

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));
// IMPORT DATA TO DATABASE
const importData = async () => {
  try {
await Tour.create(tours);
console.log('Data successfully loaded!');
  } catch(err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
await Tour.deleteMany();
console.log('Data succesfully deleted');

  } catch(err) {
    console.log(err);
  }
  process.exit();
}

 //RESET WHOLE DB
 const resetData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfuly DELETED!');
    await Tour.create(tours);
    console.log('Data successfully loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else if (process.argv[2] === '--reset') {
  resetData();
}

console.log(process.argv);