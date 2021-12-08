'use strict';
const {body} = require('express-validator');

const registerValidations = [
  body('username', 'Minimum length 3 characters! Maximum 25!').
      isLength({min: 3, max: 25}),
  body('password',
      'Minimum length 8 characters, at least one capital letter!').
      matches('(?=.*[A-Z]).{8,}').isLength({max: 50}),
];

const post3dValidations = [
  body('description',
      'Minimum length for description is 10 characters! Max 500!').
      isLength({min: 10, max: 500}),
  body('latitude',
      'Check provided latitude value! (Should be between -90 and 90 😀)').
      isFloat({min: -90, max: 90}),
  body('longitude',
      'Check provided longitude value! (Should be between -180 and 180 😀)').
      isFloat({min: -180, max: 180}),
  body('category', 'Minimum length is 3 characters for category!! Max 15!').
      isLength({min: 3, max: 15}),
  body('name', 'Minimum length is 3 characters for name! Max 20!').
      isLength({min: 3, max: 20}),
  body('type',
      'Not required files are provided, check that you have uploaded the gltf file, bin file and required/correct image files and logo image!').
      matches('(?=3dObject)'),
];

const postImageValidations = [
  body('description', 'Minimum length for description is 10 characters!').
      isLength({min: 10, max: 500}),
  body('latitude',
      'Check provided latitude value! (Should be between -90 and 90 😀)').
      isFloat({min: -90, max: 90}),
  body('longitude',
      'Check provided longitude value! (Should be between -180 and 180 😀)').
      isFloat({min: -180, max: 180}),
  body('category', 'Minimum length is 3 characters for category!').
      isLength({min: 3, max: 15}),
  body('name', 'Minimum length is 3 characters for name!').
      isLength({min: 3, max: 20}),
  body('type', 'Uploaded file is not an image!').matches('(?=image)'),
];

const postPoiValidations = [
  body('name', 'Minimum length for name is 3 characters!').
      isLength({min: 3, max: 20}),
  body('description',
      'Minumum length for poi description is 10 characters!').
      isLength({min: 10, max: 500}),
  body('category', 'Minimum length for category is 3 characters!').
      isLength({min: 3, max: 25}),
  body('latitude',
      'Check provided latitude value! (Should be between -90 and 90 😀)').
      isFloat({min: -90, max: 90}),
  body('longitude',
      'Check provided longitude value! (Should be between -180 and 180 😀)').
      isFloat({min: -180, max: 180}),
  body('x', 'Must be a number!').
      isFloat(),
  body('y', 'Must be a number!').
      isFloat(),
  body('z', 'Must be a number!').
      isFloat(),
];

const updateValidations = [
  body('description',
      'Minimum length for description is 10 characters!').
      isLength({min: 10, max: 500}),
  body('latitude',
      'Check provided latitude value! (Should be between -90 and 90 😀)').
      isFloat({min: -90, max: 90}),
  body('longitude',
      'Check provided longitude value! (Should be between -180 and 180 😀)').
      isFloat({min: -180, max: 180}),
  body('category', 'Minimum length is 3 characters for category!').
      isLength({min: 3, max: 15}),
  body('name', 'Minimum length is 3 characters for name!').
      isLength({min: 3, max: 20}),
];

const mapCoordinateUpdateValidations = [
  body('x', 'Must be a number!').
      isFloat(),
  body('y', 'Must be a number!').
      isFloat(),
  body('z', 'Must be a number!').
      isFloat(),
];

module.exports = {
  registerValidations,
  updateValidations,
  post3dValidations,
  postImageValidations,
  postPoiValidations,
  mapCoordinateUpdateValidations,
};