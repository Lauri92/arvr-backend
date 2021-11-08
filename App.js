'use strict';
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const passport = require('./utils/passportStrategies');
const authRoute = require('./routes/authRoute');
const arItemRoute = require('./routes/arItemRoute');
const utils = require('./utils/utils');

const app = express();
app.use(passport.initialize({}));
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('.')); // for index.html

// Check where the app is launched
utils.checkEnvironment(app);
utils.initializeMongoose().then(() => {
  console.log('Mongoose connected to mongodb');
});

app.use('/auth', authRoute);
app.use('/aritem',
    passport.authenticate('jwt', {session: false}),
    arItemRoute);