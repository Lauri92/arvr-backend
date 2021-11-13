'use strict';
const Schemas = require('../mongodb/schemas');
const mongoose = require('mongoose');

const getScannedItemsByUserId = async (req, res) => {
  try {
    let validIds;
    await Schemas.arUserModel.find({_id: req.user.id},
        'scannedItems -_id').then((userScannedItemIds) => {
      validIds = userScannedItemIds[0].scannedItems.filter((id) => {
        return mongoose.isValidObjectId(id);
      });
    });

    console.log(validIds);

    const scannedItems = await Schemas.arItem.find({
      '_id': {$in: validIds},
    });
    res.status(200).json(scannedItems);
  } catch (e) {
    console.log(e.message);
    res.status(400).send('Failed to fetch items 😖');
  }
};

const postScannedItemForUser = async (req, res) => {
  const insertValidation = mongoose.isValidObjectId(req.params.scanneditemid);

  let validIds;
  await Schemas.arUserModel.find({_id: req.user.id},
      'scannedItems -_id').then((userScannedItemIds) => {
    validIds = userScannedItemIds[0].scannedItems.filter((id) => {
      return mongoose.isValidObjectId(id);
    });
  });

  const duplicate = validIds.toString().includes(req.params.scanneditemid);

  if (insertValidation && !duplicate) {
    try {
      await Schemas.arUserModel.findOneAndUpdate(
          {_id: req.user.id},
          {$push: {scannedItems: req.params.scanneditemid}});

      res.status(200).json({message: 'New item inserted to scanned items'});
    } catch (e) {
      console.log(e.message);
      res.status(400).send('Failed to insert new value.');
    }
  } else {
    res.status(400).send('Not valid id value');
  }
};

const deleteScannedItemForUser = async (req, res) => {

  try {
    await Schemas.arUserModel.findOneAndUpdate({_id: req.user.id},
        {$pull: {scannedItems: req.params.scanneditemid}});
    res.status(200).json({message: 'Removed scanned item'});
  } catch (e) {
    console.log(e.message);
    res.status(400).send('Failed to remove scanned item');
  }
};

module.exports = {
  getScannedItemsByUserId,
  postScannedItemForUser,
  deleteScannedItemForUser,
};