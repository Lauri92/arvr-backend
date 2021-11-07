'use strict';
const {validationResult} = require('express-validator');
const Schemas = require('../mongodb/schemas');
const bcrypt = require('bcryptjs');

const get_message = async (req, res) => {
  res.status(200).send({message: 'Testing get route'});
};

const create_user = async (req, res) => {
  try {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    const lowerCaseBodyUsername = req.body.username.toLowerCase();
    const bodyUsernameUppercase = lowerCaseBodyUsername.charAt(0).
            toUpperCase() +
        lowerCaseBodyUsername.slice(1);

    const checkDuplicate = await Schemas.arUserModel.findOne(
        {username: `${bodyUsernameUppercase}`});

    //console.log('\x1b[36m%s\x1b[0m', `${req.body.username.toLowerCase()}`);

    if (checkDuplicate === undefined || checkDuplicate === null) {
      // Username doesn't exist
      try {
        if (!errors.isEmpty()) {
          // Errors in validation
          console.log('Errors!!', errors);
          const mappederrors = errors.errors.map((error) => {
            return `Input field: ${error.param}, error: ${error.msg}\n`;
          });
          res.status(200).json({message: `${mappederrors}`});
        } else {
          // No errors, salt and hash pw
          const salt = bcrypt.genSaltSync(10);
          req.body.password = bcrypt.hashSync(req.body.password, salt);
          const user = {
            username: bodyUsernameUppercase,
            password: req.body.password,
          };

          try {
            await Schemas.arUserModel.create(user);
            res.status(200).json({message: `${req.body.username} inserted!`});
          } catch (e) {
            res.status(200).json({message: 'We failed to insert'});
          }

        }
      } catch (e) {
        console.error('e:', e);
        res.status(400).json({message: 'Error inserting user!'});
      }
    } else {
      // Username exists
      res.status(200).json({message: 'User name already exists!'});
    }
  } catch (e) {
    res.status(200).json({message: 'Failed to insert 😣'});
  }

};

module.exports = {
  get_message,
  create_user,
};