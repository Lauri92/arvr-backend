'use strict';
const express = require('express');
const router = express.Router();
const {body} = require('express-validator');
const arItemController = require('../controllers/arItemController');
const multerUtils = require('../utils/multerUtils');

router.route('/').
    get(arItemController.getSecuredItem).
    post(multerUtils.upload.single('avatar'), multerUtils.injectFile,
        arItemController.postItem);

module.exports = router;