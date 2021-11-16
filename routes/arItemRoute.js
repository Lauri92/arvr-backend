'use strict';
const express = require('express');
const router = express.Router();
const {body} = require('express-validator');
const arItemController = require('../controllers/arItemController');
const multerUtils = require('../utils/multerUtils');

router.route('/').
    get(arItemController.getSecuredItem).
    post(multerUtils.uploadSingle.single('avatar'), multerUtils.injectFile, [
          body('description', 'Minimum length for description is 10 characters!').
              isLength({min: 10}),
          body('latitude',
              'Check provided latitude value! (Should be between -90 and 90 😀)').
              isFloat({min: -90, max: 90}),
          body('longitude',
              'Check provided longitude value! (Should be between -180 and 180 😀)').
              isFloat({min: -180, max: 180}),
          body('category', 'Minimum length is 3 characters for category!').
              isLength({min: 3}),
          body('name', 'Minimum length is 3 characters for name!').
              isLength({min: 3}),
          body('type', 'Uploaded file is not an image!').matches('(?=image)'),
        ],
        arItemController.validateItemInfoAndUploadToAzure,
        arItemController.insertItemToDb);

const cpUpload = multerUtils.upload3d.fields([
  {name: 'gltf', maxCount: 1},
  {name: 'bin', maxCount: 1},
  {name: 'imageGallery', maxCount: 200}]);

router.route('/3d').post(cpUpload, multerUtils.inject3dFileTypes, [
      body('description', 'Minimum length for description is 10 characters!').
          isLength({min: 10}),
      body('latitude',
          'Check provided latitude value! (Should be between -90 and 90 😀)').
          isFloat({min: -90, max: 90}),
      body('longitude',
          'Check provided longitude value! (Should be between -180 and 180 😀)').
          isFloat({min: -180, max: 180}),
      body('category', 'Minimum length is 3 characters for category!').
          isLength({min: 3}),
      body('name', 'Minimum length is 3 characters for name!').
          isLength({min: 3}),
      body('type',
          'Not required files are provided, check that you have uploaded the gltf file, bin file and required/correct image files!').
          matches('(?=3dObject)'),
    ], arItemController.validate3dItemInfoAndUploadToAzure,
    arItemController.insertItemToDb);

router.route('/contentmanager').
    get(arItemController.getArItemsByContentManagerId);

router.route('/update').
    patch([
      body('description',
          'Minimum length for description is 10 characters!').
          isLength({min: 10}),
      body('latitude',
          'Check provided latitude value! (Should be between -90 and 90 😀)').
          isFloat({min: -90, max: 90}),
      body('longitude',
          'Check provided longitude value! (Should be between -180 and 180 😀)').
          isFloat({min: -180, max: 180}),
      body('category', 'Minimum length is 3 characters for category!').
          isLength({min: 3}),
      body('name', 'Minimum length is 3 characters for name!').
          isLength({min: 3})], arItemController.updateItem);

router.route('/:id').get(arItemController.getSingleArItemById);

module.exports = router;