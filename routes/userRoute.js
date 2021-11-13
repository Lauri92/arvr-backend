'use strict';
const express = require('express');
const userController = require('../controllers/userController');
const multerUtils = require('../utils/multerUtils');
const {body} = require('express-validator');
const router = express.Router();

router.route('/userscanneditems').get(userController.getScannedItemsByUserId);
router.route('/userscanneditems/:scanneditemid').
    post(userController.postScannedItemForUser).
    delete(userController.deleteScannedItemForUser);

module.exports = router;