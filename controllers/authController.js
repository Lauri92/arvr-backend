'use strict';
const {validationResult} = require('express-validator');

const get_message = async (req, res, next) => {
  console.log(req);
  res.status(200).send({message: 'get_message'});
};

const post_user = async (req, res, next) => {
  // Extract the validation errors from a request.
  const errors = validationResult(req);
  console.log(`req.body: ${req.body}`);
  console.log(`errors: ${errors}`);
  res.status(200).send({message: 'post_user'});
};

module.exports = {
  get_message,
  post_user,
};