'use strict';
const express = require('express');
const router = express.Router();
const {body} = require('express-validator');
const authController = require('../controllers/arItemController');

router.route('/').
    get(authController.getSecuredItem);

module.exports = router;