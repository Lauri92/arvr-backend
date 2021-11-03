'use strict';
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('.')); // for index.html

require('./localhost')(app, process.env.HTTPS_PORT, process.env.HTTP_PORT);
console.log('App started on localhost.');