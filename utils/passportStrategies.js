'use strict';
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const Schemas = require('../mongodb/schemas');
const bcrypt = require('bcryptjs');

// local strategy for username password login
passport.use(new Strategy(
    async (username, password, done) => {
      try {
        // Search for user from database with given username
        const user = await Schemas.arUserModel.findOne(
            {username: `${username}`});
        if (user === null) {
          // No user found
          return done(null, false, {message: 'Username not found'});
        }
        // Test string provided in password against hash
        const isSync = await (bcrypt.compareSync(password, user.password));
        if (!isSync) {
          // Provided pw doesn't match the hash
          return done(null, false, {message: 'Wrong password'});
        }
        // was match
        return done(null, user);
      } catch (e) {
        console.log("catch error", e.message);
      }
    }));

module.exports = passport;