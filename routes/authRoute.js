'use strict';
const express = require('express');
const router = express.Router();
//const authController = require('../Controllers/authController');
const {body} = require('express-validator');
const authController = require('../controllers/authController');

router.get('/register',
    authController.user_create_post,
);

module.exports = router;