'use strict';
const {BlobServiceClient} = require('@azure/storage-blob');
const storageAccountConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const blobServiceClient = BlobServiceClient.fromConnectionString(
    storageAccountConnectionString);
const fs = require('fs');
const FileType = require('file-type');
const {validationResult} = require('express-validator');
const QRCode = require('qrcode');
const Schemas = require('../mongodb/schemas');

const getSecuredItem = async (req, res) => {
  res.status(200).send({message: 'Get secured item'});
};

const handleNoContentManager = async (req, res) => {
  try {
    await fs.unlink(req.file.filename, err => {
      if (err) throw err;
    });
    res.status(400).send('You are not allowed to post items!😑');
  } catch (e) {
    console.log(e.message);
    res.status(400).send('You are not allowed to post items!😑');
  }
};

const handleErrorsInValidation = async (req, res, validationErrors) => {
  const mappedErrors = validationErrors.errors.map((error) => {
    return `${error.param} error: ${error.msg}`;
  });
  try {
    if (req.body.type) {
      await fs.unlink(req.file.filename, err => {
        if (err) throw err;
      });
    }
    res.status(400).send(mappedErrors);
  } catch (e) {
    console.log(e.message);
    res.status(400).send(mappedErrors);
  }
};

const insertImageToAzure = async (req, res, next) => {
  try {
    const containerName = 'images';
    const containerClient = blobServiceClient.getContainerClient(
        containerName);
    const createContainerResponse = await containerClient.createIfNotExists();
    console.log(`Create container ${containerName} successfully`,
        createContainerResponse.succeeded);
    // Upload the file
    const filename = `${req.file.filename}`;
    const filetype = await FileType.fromFile(filename);
    const newName = `${filename}.${filetype.ext}`;
    await fs.rename(filename, newName, () => {
      console.log('renamed');
    });

    const blockBlobClient = containerClient.getBlockBlobClient(
        newName);
    await blockBlobClient.uploadFile(newName);
    await fs.unlink(newName, err => {
      if (err) throw err;
    });
    req.body.imageReference = newName;
    next();
  } catch (e) {
    console.log(e);
    res.status(400).send('Failed to upload 😥');
  }
};

const validateItemInfoAndUploadToAzure = async (req, res, next) => {
  const validationErrors = await validationResult(req);
  if (!req.user.contentManager) {
    await handleNoContentManager(req, res);
  } else if (!validationErrors.isEmpty()) {
    await handleErrorsInValidation(req, res, validationErrors);
  } else {
    await insertImageToAzure(req, res, next);
  }
};

const insertItemToDb = async (req, res, next) => {
  const arItem = {
    userId: req.user.id,
    type: req.body.type,
    imageReference: req.body.imageReference,
    name: req.body.name,
    description: req.body.description,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    category: req.body.category,
    QRCode: '123',
  };

  try {
    const inserted = await Schemas.arItem.create(arItem);
    QRCode.toDataURL(inserted.id, {
          errorCorrectionLevel: 'H', color: {
            dark: '#0b9901',
            light: '#ffffff',
          },
        },
        async function(err, url) {
          const doc = await Schemas.arItem.findById(inserted);
          doc.QRCode = url;
          await doc.save();
        });
    res.status(200).send({message: 'Uploaded image to Azure and updated DB🤗'});
  } catch (e) {
    console.log(e.message);
    await fs.unlink(req.body.imageReference, err => {
      if (err) throw err;
    });
    res.status(400).set('Failed to upload 🤔');
  }
};

module.exports = {
  getSecuredItem,
  validateItemInfoAndUploadToAzure,
  insertItemToDb,
};