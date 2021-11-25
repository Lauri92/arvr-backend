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
    req.body.objectReference = `images/${newName}`;
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
    if (req.files['gltf']) {
      for (const gltf of req.files['gltf']) {
        const filename = `${dir}/${gltf.originalname}`;
        const blockBlobClient = await containerClient.getBlockBlobClient(
            filename);
        await blockBlobClient.uploadFile(filename);
      }
    }
    if (req.files['bin']) {
      for (const bin of req.files['bin']) {
        const filename = `${dir}/${bin.originalname}`;
        const blockBlobClient = await containerClient.getBlockBlobClient(
            filename);
        await blockBlobClient.uploadFile(filename);
      }
    }

    if (req.files['logoImageReference']) {
      for (const logoImage of req.files['logoImageReference']) {
        const filename = `${dir}/${logoImage.originalname}`;
        const blockBlobClient = await containerClient.getBlockBlobClient(
            filename);
        await blockBlobClient.uploadFile(filename);
      }
    }

    if (req.files['imageGallery']) {
      for (const image of req.files['imageGallery']) {
        const filename = `${dir}/${image.originalname}`;
        const blockBlobClient = await containerClient.getBlockBlobClient(
            filename);
        await blockBlobClient.uploadFile(filename);
      }
    }

    req.body.objectReference = `objects/${dir}/${req.files['gltf'][0].originalname}`;
    req.body.logoImageReference = `objects/${dir}/${req.files['logoImageReference'][0].originalname}`;
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

  if (req.files['logoImageReference']) {
    await fs.unlink(`./uploads/${req.files['logoImageReference'][0].filename}`,
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

const rename3dItemsToOriginalNameAndMoveToNewDirectory = async (req, res) => {
  try {
    const dir = uuidv4();
    await fs.mkdirSync(dir);
    if (req.files['gltf'][0].filename) {
      await fs.rename(`./uploads/${req.files['gltf'][0].filename}`,
          `./${dir}/${req.files['gltf'][0].originalname}`,
          () => {
            console.log('moved?');
          });
    }
    if (req.files['bin'][0].filename) {
      await fs.rename(`./uploads/${req.files['bin'][0].filename}`,
          `./${dir}/${req.files['bin'][0].originalname}`,
          () => {
            console.log('moved?');
          });
    }
    if (req.files['logoImageReference'][0].filename) {
      await fs.rename(
          `./uploads/${req.files['logoImageReference'][0].filename}`,
          `./${dir}/${req.files['logoImageReference'][0].originalname}`,
          () => {
            console.log('moved?');
          });
    }
    if (req.files['imageGallery']) {
      for (const image of req.files['imageGallery']) {
        await fs.rename(`./uploads/${image.filename}`,
            `./${dir}/${image.originalname}`, err => {
              if (err) throw err;
            });
      }
    }
    return dir;
  } catch (e) {
    console.log(e.message);
    await unlink3dItems(req);
    res.send(400).send('Failed to upload');
  }
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
      const dir = await rename3dItemsToOriginalNameAndMoveToNewDirectory(req,
          res);
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
    objectReference: req.body.objectReference,
    logoImageReference: req.body.logoImageReference,
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
        async (err, url) => {
          const doc = await Schemas.arItem.findById(inserted);
          doc.QRCode = url;
          await doc.save();
        });
    res.status(200).
        send({message: 'Uploaded item to Azure and updated DB🤗'});
  } catch (e) {
    console.log(e.message);
    await fs.unlink(req.body.objectReference, err => {
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

const updateItem = async (req, res) => {

  const allowedParams = [
    'description',
    'latitude',
    'longitude',
    'name',
    'category',
  ];

  if (allowedParams.includes(req.query.param)) {
    try {
      const validationErrors = await validationResult(req);

      const fieldErrors = validationErrors.errors.filter((errorParam) => {
        return req.query.param === errorParam.param;
      });

      const objectToBeUpdated = await Schemas.arItem.findOne(
          {'_id': req.params.aritemid});

      if (fieldErrors[0]) {
        res.status(400).send(fieldErrors[0].msg);
      } else if (objectToBeUpdated.userId !== req.user.id) {
        res.status(400).send('Cheeky cheeky 🤨');
      } else {
        let bodyValue;
        const getBodyValue = {
          'description': () => bodyValue = req.body.description,
          'latitude': () => bodyValue = req.body.latitude,
          'longitude': () => bodyValue = req.body.longitude,
          'category': () => bodyValue = req.body.category,
          'name': () => bodyValue = req.body.name,
          'default': () => res.status(400).send('Failed to insert'),
        };

        await (getBodyValue[req.query.param] || getBodyValue['default'])();

        const filter = {'_id': req.params.aritemid};
        const updateColumn = {[req.query.param]: bodyValue};
        await Schemas.arItem.updateOne(filter, updateColumn);
        res.status(200).json({message: `Updated ${req.query.param}`});
      }
    } catch (e) {
      console.log(e.message);
      res.status(400).send('Failed to update');
    }
  } else {
    res.status(400).send('Failed to update, check param');
  }
};

const deleteItem = async (req, res) => {

  try {
    const filter = {'_id': req.params.aritemid};
    const itemToBeRemoved = await Schemas.arItem.findOne(filter);
    const poisToBeRemoved = itemToBeRemoved.pois;

    const itemId = itemToBeRemoved.objectReference.substring(8, 44);
    const objectContainer = await blobServiceClient.getContainerClient(
        `objects`);
    const poiImageContainer = await blobServiceClient.getContainerClient(
        `poiimages`);
    let blobs = objectContainer.listBlobsFlat();
    let blob = await blobs.next();
    let objectFiles = [];
    while (!blob.done) {
      if (blob.value.name.includes(itemId)) {
        objectFiles.push(blob.value.name);
      }
      blob = await blobs.next();
    }

    // Remove the 3D files
    for (const file of objectFiles) {
      await objectContainer.deleteBlob(file);
    }

    // Remove the poi images
    for (const poi of poisToBeRemoved) {
      if (poi.poiImage !== 'poiimages/poidefault') {
        await poiImageContainer.deleteBlob(poi.poiImage.substring(10));
        //console.log(poi.poiImage.substring(10));
      }
    }

    Schemas.arItem.deleteOne(filter, function(err) {
      if (err) {
        console.log(err);
        res.status(400).send('Failed to remove');
      }
    });

    res.status(200).json({message: 'Removed item successfully'});
  } catch (e) {
    console.log(e.message);
    res.status(400).send(`Failed to remove item ${e.message}`);
  }
};

const postPointsOfInterest = async (req, res) => {

  try {
    const validationErrors = await validationResult(req);
    const objectToBeUpdated = await Schemas.arItem.findOne(
        {'_id': req.params.aritemid});
    if (!validationErrors.isEmpty()) {
      res.status(400).send(validationErrors.array());
    } else if (objectToBeUpdated.userId !== req.user.id) {
      res.status(400).send('Cheeky cheeky');
    } else {
      const id = uuidv4();
      if (req.body.type) {
        try {
          const containerName = 'poiimages';
          const containerClient = await blobServiceClient.getContainerClient(
              containerName);
          const createContainerResponse = await containerClient.createIfNotExists();
          console.log(`Create container ${containerName} successfully`,
              createContainerResponse.succeeded);
          const filename = `${req.file.filename}`;
          // const filetype = await FileType.fromFile(filename);
          //const newName = `${filename}.${filetype.ext}`;
          //await fs.rename(filename, newName, () => {
          //console.log('renamed');
          //});
          const blockBlobClient = await containerClient.getBlockBlobClient(
              filename);
          await blockBlobClient.uploadFile(filename);
          await fs.unlink(filename, err => {
            if (err) throw err;
          });
          req.body.poiImage = `poiimages/${filename}`;
        } catch (e) {
          console.log(e);
          const filename = `${req.file.filename}`;
          const filetype = await FileType.fromFile(filename);
          const newName = `${filename}.${filetype.ext}`;
          await fs.unlink(newName, err => {
            if (err) throw err;
          });
          res.status(400).send('Failed to upload 😥');
        }
      } else {
        req.body.poiImage = `poiimages/poidefault`;
      }
      const poi = {
        poiId: id,
        name: req.body.name,
        description: req.body.description,
        x: Number(req.body.x),
        y: Number(req.body.y),
        z: Number(req.body.z),
        poiImage: req.body.poiImage,
      };
      const filter = {'_id': req.params.aritemid};
      await Schemas.arItem.updateOne(filter,
          {
            $push: {pois: poi},
          });

      res.status(200).json({message: 'Added a new point of interest!'});
    }
  } catch (e) {
    console.log(e.message);
    res.status(400).send('Failed to upload poi!');
  }
};

const deletePointOfInterest = async (req, res) => {

  try {
    const objectToBeUpdated = await Schemas.arItem.findOne(
        {'_id': req.params.aritemid});
    if (objectToBeUpdated.userId !== req.user.id) {
      res.status(400).send('Cheeky cheeky');
    } else {
      const testertester = await Schemas.arItem.findOneAndUpdate(
          {_id: req.params.aritemid},
          {$pull: {pois: {poiId: req.query.id}}});
      const pois = testertester.pois;
      const azureImageUrl = pois.filter((poi) => {
        return poi.poiId === req.query.id;
      });
      if (azureImageUrl[0].poiImage !== 'poiimages/poidefault') {
        const blobToDelete = azureImageUrl[0].poiImage.substring(10).toString();
        const container = await blobServiceClient.getContainerClient(
            `poiimages`);
        await container.deleteBlob(blobToDelete);
      }

      res.status(200).json({message: 'Removed point of interest!'});
    }
  } catch (e) {
    console.log(e.message);
    res.status(400).send('Failed to remove poi');
  }
};

module.exports = {
  getSecuredItem,
  validateItemInfoAndUploadToAzure,
  validate3dItemInfoAndUploadToAzure,
  insertItemToDb,
  getSingleArItemById,
  getArItemsByContentManagerId,
  updateItem,
  deleteItem,
  postPointsOfInterest,
  deletePointOfInterest,
};