'use strict';
const {body} = require('express-validator');

const registerValidations = [
  body('username', 'Minimum length 3 characters!').
      isLength({min: 3}),
  body('password',
      'Minimum length 8 characters, at least one capital letter!').
      matches('(?=.*[A-Z]).{8,}'),
];

const post3dValidations = [
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
];

const postImageValidations = [
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
];

const updateValidations = [
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
      isLength({min: 3}),
];

module.exports = {
  registerValidations,
  updateValidations,
  post3dValidations,
  postImageValidations,
};