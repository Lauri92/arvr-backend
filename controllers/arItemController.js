'use strict';
const {BlobServiceClient} = require('@azure/storage-blob');
const storageAccountConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const blobServiceClient = BlobServiceClient.fromConnectionString(
    storageAccountConnectionString);
const fs = require('fs');
const FileType = require('file-type');
const {validationResult} = require('express-validator');
const QRCode = require('qrcode');
const {v4: uuidv4} = require('uuid');
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

const insert3dObjectToAzure = async (req, res, next, dir) => {

  try {
    const containerName = 'objects';
    const containerClient = blobServiceClient.getContainerClient(
        containerName);
    const createContainerResponse = await containerClient.createIfNotExists();
    console.log(`Create container ${containerName} successfully`,
        createContainerResponse.succeeded);
    // Upload the file

    for (const gltf of req.files['gltf']) {
      const filename = `${dir}/${gltf.originalname}`;
      const blockBlobClient = await containerClient.getBlockBlobClient(
          filename);
      await blockBlobClient.uploadFile(filename);
    }
    for (const bin of req.files['bin']) {
      const filename = `${dir}/${bin.originalname}`;
      const blockBlobClient = await containerClient.getBlockBlobClient(
          filename);
      await blockBlobClient.uploadFile(filename);
    }

    for (const image of req.files['imageGallery']) {
      const filename = `${dir}/${image.originalname}`;
      const blockBlobClient = await containerClient.getBlockBlobClient(
          filename);
      await blockBlobClient.uploadFile(filename);
    }

    req.body.imageReference = `${dir}/${req.files['gltf'][0].originalname}`;
    fs.rmSync(dir, {recursive: true, force: true});

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

const unlink3dItems = async (req) => {
  if (req.files['gltf']) {
    await fs.unlink(`./uploads/${req.files['gltf'][0].filename}`,
        err => {
          if (err) throw err;
        });
  }
  if (req.files['bin']) {
    await fs.unlink(`./uploads/${req.files['bin'][0].filename}`,
        err => {
          if (err) throw err;
        });
  }
  if (req.files['imageGallery']) {
    for (const image of req.files['imageGallery']) {
      await fs.unlink(`./uploads/${image.filename}`, err => {
        if (err) throw err;
      });
    }
  }
};

const rename3dItemsToOriginalNameAndMoveToNewDirectory = async (req) => {
  const dir = uuidv4();
  await fs.mkdirSync(dir);
  await fs.rename(`./uploads/${req.files['gltf'][0].filename}`,
      `./${dir}/${req.files['gltf'][0].originalname}`,
      () => {
        console.log('moved?');
      });
  await fs.rename(`./uploads/${req.files['bin'][0].filename}`,
      `./${dir}/${req.files['bin'][0].originalname}`,
      () => {
        console.log('moved?');
      });

  for (const image of req.files['imageGallery']) {
    await fs.rename(`./uploads/${image.filename}`,
        `./${dir}/${image.originalname}`, err => {
          if (err) throw err;
        });
  }
  return dir;
};

const validate3dItemInfoAndUploadToAzure = async (req, res, next) => {
  const validationErrors = await validationResult(req);
  if (!req.user.contentManager) {
    try {
      await unlink3dItems(req);
      res.status(400).send('You are not allowed to post items!😑');
    } catch (e) {
      console.log(e.message);
      res.status(400).send('You are not allowed to post items!😑');
    }
  } else if (!validationErrors.isEmpty()) {
    const mappedErrors = validationErrors.errors.map((error) => {
      return `${error.param} error: ${error.msg}`;
    });
    try {
      await unlink3dItems(req);
      res.status(400).send(mappedErrors);
    } catch (e) {
      console.log(e.message);
      res.status(400).send(mappedErrors);
    }
  } else {
    try {
      const dir = await rename3dItemsToOriginalNameAndMoveToNewDirectory(req);
      await insert3dObjectToAzure(req, res, next, dir);
    } catch (e) {
      await unlink3dItems(req);
      console.log(e.message);
      res.status(400).send('Failed to upload');
    }
  }
};

const insertItemToDb = async (req, res) => {
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
    res.status(200).
        send({message: 'Uploaded item to Azure and updated DB🤗'});
  } catch (e) {
    console.log(e.message);
    await fs.unlink(req.body.imageReference, err => {
      if (err) throw err;
    });
    res.status(400).set('Failed to upload 🤔');
  }
};

const getSingleArItemById = async (req, res) => {
  try {
    const doc = await Schemas.arItem.findById(req.params.id);
    res.status(200).send(doc);
  } catch (e) {
    console.log(e.message);
    res.status(400).send('Failed to fetch AR item 🙁');
  }
};

const getArItemsByContentManagerId = async (req, res) => {
  try {
    const doc = await Schemas.arItem.
        find({
          userId: req.user.id,
        });
    res.status(200).send(doc);
  } catch (e) {
    console.log(e.message);
    res.status(400).send('Failed to fetch AR items 🙁');
  }
};

module.exports = {
  getSecuredItem,
  validateItemInfoAndUploadToAzure,
  validate3dItemInfoAndUploadToAzure,
  insertItemToDb,
  getSingleArItemById,
  getArItemsByContentManagerId,
};