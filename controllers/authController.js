'use strict';
const {validationResult} = require('express-validator');
const Schemas = require('../mongodb/schemas');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userModel = require('../models/arUserModel');

const get_message = async (req, res, next) => {
  res.status(200).send({message: 'Testing get route'});
};

const create_user = async (req, res, next) => {
  // Extract the validation errors from a request.
  const errors = validationResult(req);

  const checkDuplicate = await Schemas.arUserModel.findOne(
      {username: `${req.body.username}`});

  if (checkDuplicate === null) {
    // Username doesn't exist
    try {
      if (!errors.isEmpty()) {
        // Errors in validation
        console.log('Errors!!', errors);
        res.status(200).json({message: 'Errors in validation!'});
      } else {
        console.log('No errors when posting user!');

        // No errors, salt and hash pw
        const salt = bcrypt.genSaltSync(10);
        req.body.password = bcrypt.hashSync(req.body.password, salt);
        const user = {
          username: req.body.username,
          password: req.body.password,
        };

        try {
          await Schemas.arUserModel.create(user);
          res.status(200).json({message: `${req.body.username} inserted!`});
        } catch (e) {
          console.log(e.message);
          res.status(200).json({message: 'We failed to insert'});
        }

      }
    } catch (e) {
      console.error('e:', e);
      res.status(400).json({message: 'Error insterting user!'});
    }
  } else {
    res.status(200).json({message: 'User name already exists!'});
  }

};

module.exports = {
  get_message,
  create_user,
};