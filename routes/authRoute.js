'use strict';
const express = require('express');
const router = express.Router();
const {body} = require('express-validator');
const authController = require('../controllers/authController');

router.route('/register').
    get(authController.get_message).
    post([
      body('username', 'Minimum length 3 characters!').
          isLength({min: 3}),
      body('password',
          'Minimum length 8 characters, at least one capital letter!').
          matches('(?=.*[A-Z]).{8,}'),
    ], authController.create_user);


router.post('/login', authController.login);
router.get('/logout', authController.logout);
module.exports = router;