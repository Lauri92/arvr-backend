'use strict';
const express = require('express');
const router = express.Router();
const {body} = require('express-validator');
const authController = require('../controllers/authController');
const {registerValidations} = require('../utils/validationUtils');

router.route('/register').
    get(authController.get_message).
    post(registerValidations, authController.create_user);

router.post('/login', authController.login);
router.get('/logout', authController.logout);
module.exports = router;