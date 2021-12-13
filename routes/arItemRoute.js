'use strict';
const express = require('express');
const router = express.Router();
const arItemController = require('../controllers/arItemController');
const multerUtils = require('../utils/multerUtils');
const validationUtils = require('../utils/validationUtils');

router.route('/').get(arItemController.getSecuredItem);

const cpUpload = multerUtils.upload3d.fields([
  {name: 'gltf', maxCount: 1},
  {name: 'bin', maxCount: 1},
  {name: 'logoImageReference', maxCount: 1},
  {name: 'imageGallery', maxCount: 300}]);

router.route('/3d').
    post(cpUpload,
        multerUtils.inject3dFileTypes,
        validationUtils.post3dValidations,
        arItemController.validate3dItemInfoAndUploadToAzure,
        arItemController.insertItemToDb);

router.route('/contentmanager').
    get(arItemController.getArItemsByContentManagerId);

router.route('/pois/:aritemid').
    post(multerUtils.uploadSingle.single('avatar'),
        multerUtils.injectFile, validationUtils.postPoiValidations,
        arItemController.postPointsOfInterest).
    patch(validationUtils.updateValidations,
        arItemController.updatePointOfInterestBasicValues).
    put(validationUtils.mapCoordinateUpdateValidations,
        arItemController.updatePointOfInterestMapCoordinates).
    delete(arItemController.deletePointOfInterest);

router.route('/update/:aritemid').
    patch(validationUtils.updateValidations, arItemController.updateItem);

router.route('/delete/:aritemid').
    delete(arItemController.deleteItem);

router.route('/:id').get(arItemController.getSingleArItemById);

module.exports = router;