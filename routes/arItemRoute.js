'use strict';
const express = require('express');
const router = express.Router();
const {body} = require('express-validator');
const arItemController = require('../controllers/arItemController');
const multerUtils = require('../utils/multerUtils');

router.route('/').
    get(arItemController.getSecuredItem).
    post(multerUtils.upload.single('avatar'), multerUtils.injectFile, [
          body('description',
              'Minimum length 10 characters!').
              isLength({min: 10}),
          body('type', 'Uploaded file is not an image!').matches('(?=image)'),
        ],
        arItemController.postItem, arItemController.insertItemToDb);

module.exports = router;