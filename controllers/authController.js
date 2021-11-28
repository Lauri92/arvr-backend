'use strict';
const {validationResult} = require('express-validator');
const Schemas = require('../mongodb/schemas');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const get_message = async (req, res) => {
  res.status(200).send({message: 'Testing get route'});
};

const create_user = async (req, res) => {
  try {
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
          const mappedErrors = errors.errors.map((error) => {
            return `Input field: ${error.param}, error: ${error.msg}\n`;
          });
          res.status(400).send(`${mappedErrors}`);
        } else {
          // No errors, salt and hash pw
          const salt = bcrypt.genSaltSync(10);
          req.body.password = bcrypt.hashSync(req.body.password, salt);
          let user;
          if (req.body.contentManager) {
            user = {
              username: bodyUsernameUppercase,
              password: req.body.password,
              contentManager: 1,
            };
          } else {
            user = {
              username: bodyUsernameUppercase,
              password: req.body.password,
              contentManager: 0,
            };
          }

          try {
            await Schemas.arUserModel.create(user);
            res.status(200).json({message: `${req.body.username} inserted!`});
          } catch (e) {
            res.status(400).send('We failed to insert');
          }

        }
      } catch (e) {
        console.error('e:', e);
        res.status(400).send('Error inserting user!😣');
      }
    } else {
      // Username exists
      res.status(400).send('Username already exists!😣');
    }
  } catch (e) {
    res.status(400).send('Failed to insert 😣');
  }

};

const login = (req, res) => {
  passport.authenticate('local', {session: false}, (err, user, info) => {
    console.log('authcontroller user:', user);
    if (err || !user) {
      return res.status(400).send(`${info.message} 😣`);
    }
    req.login(user, {session: false}, (err) => {
      if (err) {
        res.status(400).send('Error logging in.');
      }
      const {username, _id, contentManager} = user;
      const tokenUser = {
        id: _id,
        username: username,
        contentManager: contentManager,
      };
      const token = jwt.sign(tokenUser, process.env.JWT);
      return res.status(200).json({message: token});
    });

  })(req, res);
};

const logout = (req, res) => {
  req.logout();
  res.send('You have logged out');
};

module.exports = {
  get_message,
  create_user,
  login,
  logout,
};