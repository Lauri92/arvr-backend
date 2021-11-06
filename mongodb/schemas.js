const mongoose = require('mongoose');

const ArUserSchema = new mongoose.Schema({
  username: {type: String, required: true},
  password: {type: String, required: true},
});
const arUserModel = mongoose.model('ArUser', ArUserSchema);

const ArItemSchema = new mongoose.Schema({
  property1: {type: String, required: true},
  property2: {type: String, required: true},
});
const arItem = mongoose.model('ArItem', ArItemSchema);


module.exports = {
  arUserModel,
  arItem
};

