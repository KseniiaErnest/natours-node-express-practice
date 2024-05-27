const express = require('express');
const viewController = require('../controllers/viewController')

const viewRouter = express.Router();

viewRouter.get('/', (req, res) => {
  res.status(200).render('base', {
    tour: 'The Forest Hiker',
    user: 'Kseniia'
  });
});

viewRouter.get('/', viewController.getOverview);

viewRouter.get('/tour', viewController.getTour);

module.exports = viewRouter;