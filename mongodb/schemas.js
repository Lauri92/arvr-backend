const mongoose = require('mongoose');

const ArUserSchema = new mongoose.Schema({
  username: {type: String, required: true},
  password: {type: String, required: true},
  scannedItems: {type: Array, required: false},
  contentManager: {type: Boolean, required: true},
});
const arUserModel = mongoose.model('ArUser', ArUserSchema);

const ArItemSchema = new mongoose.Schema({
  userId: {type: String, required: true},
  type: {type: String, required: true},
  imageReference: {type: String, required: true},
  name: {type: String, required: true},
  description: {type: String, required: true},
  latitude: {type: Number, required: true},
  longitude: {type: Number, required: true},
  category: {type: String, required: true},
  pois : { type : Array , "default" : [] },
  QRCode: {type: String, required: true},
});
const arItem = mongoose.model('ArItem', ArItemSchema);


module.exports = {
  arUserModel,
  arItem
};

