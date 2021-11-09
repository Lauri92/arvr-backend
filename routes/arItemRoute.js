'use strict';
const express = require('express');
const router = express.Router();
const {body} = require('express-validator');
const arItemController = require('../controllers/arItemController');

const {mediaFileFilter} = require('../utils/multerUtils');
const multer = require('multer');

const upload = multer({
  dest: 'uploads/', onError: function(err, next) {
    console.log('error', err);
    next(err);
  }, mediaFileFilter,
});


router.route('/').
    get(arItemController.getSecuredItem).
    post(upload.single('avatar'), arItemController.postItem);

module.exports = router;