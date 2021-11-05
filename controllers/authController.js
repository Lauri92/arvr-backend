'use strict';
const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

const get_message = async (req, res, next) => {
  console.log(req);
  res.status(200).send({message: 'get_message'});
};

const create_user = async (req, res, next) => {
  // Extract the validation errors from a request.
  const errors = validationResult(req);

  try {

    //const isUsernameTaken = userModel.checkUsernameAvailability(req.body.username);

    //const available = isUsernameTaken === undefined;
    //console.log(available);

    if (!errors.isEmpty()) {
      console.log('Errors!!', errors);
      // Errors in validation
      res.status(200).json({message: 'Errors in validation!'});
    } else {
      console.log('No errors!');
      // No errors, salt and hash pw
      const salt = bcrypt.genSaltSync(10);
      req.body.password = bcrypt.hashSync(req.body.password, salt);
      const user = {
        username: req.body.username,
        password: req.body.password,
      };

      if (await userModel.insertUser(user)) {
        res.status(200).
            json({message: 'Registration successful and account created'});
      } else {
        res.status(400).json({message: 'Register error!'});
      }
    }
  } catch (e) {
    console.error('e:', e);
    res.status(400).json({message: 'Error insterting user!'});
  }
};

module.exports = {
  get_message,
  create_user,
};