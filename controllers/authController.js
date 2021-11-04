'use strict';
const {validationResult} = require('express-validator');

const get_message = async (req, res, next) => {
  console.log(req);
  res.status(200).send({message: 'get_message'});
};

const post_user = async (req, res, next) => {

  // Extract the validation errors from a request.
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      // Errors in validation
      console.log('user create error', errors);
      res.status(200).send({message: 'Errors in validation!'});
    } else {
      // No errors
      console.log('user create no errors!');
      res.status(200).send({message: 'No errors in validation!'});
    }
  } catch (e) {
    console.error('e:', e);
  }
};

module.exports = {
  get_message,
  post_user,
};