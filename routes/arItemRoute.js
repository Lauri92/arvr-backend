'use strict';
const express = require('express');
const router = express.Router();
const {body} = require('express-validator');
const arItemController = require('../controllers/arItemController');
const multerUtils = require('../utils/multerUtils');

router.route('/').
    get(arItemController.getSecuredItem).
    post(multerUtils.upload.single('avatar'), multerUtils.injectFile, [
          body('description', 'Minimum length for description is 10 characters!').
              isLength({min: 10}),
          body('latitude',
              'Check provided latitude value! (Should be between -90 and 90 😀)').
              isFloat({min: -90, max: 90}),
          body('longitude',
              'Check provided longitude value! (Should be between -180 and 180 😀)').
              isFloat({min: -180, max: 180}),
          body('category', 'Minimum length is 3 characters for category!').
              isLength({min: 3}),
          body('name', 'Minimum length is 3 characters for name!').
              isLength({min: 3}),
          body('type', 'Uploaded file is not an image!').matches('(?=image)'),
        ],
        arItemController.validateItemInfoAndUploadToAzure, arItemController.insertItemToDb);

module.exports = router;