'use strict';
const express = require('express');
const router = express.Router();
//const authController = require('../Controllers/authController');
const {body} = require('express-validator');
const authController = require('../controllers/authController');

router.route('/register').
    get(authController.get_message).
    post(authController.post_user);

module.exports = router;