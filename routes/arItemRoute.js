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

const go_here = async (req, res, next) => {
  console.log("got here");
}

router.route('/').
    get(arItemController.getSecuredItem).
    post(upload.single('avatar'), go_here);

module.exports = router;