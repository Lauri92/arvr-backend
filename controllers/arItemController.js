'use strict';
const {BlobServiceClient} = require('@azure/storage-blob');
const storageAccountConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const blobServiceClient = BlobServiceClient.fromConnectionString(
    storageAccountConnectionString);
const fs = require('fs');
const FileType = require('file-type');
const {validationResult} = require('express-validator');

const getSecuredItem = async (req, res) => {
  res.status(200).send({message: 'Get secured item'});
};

const postItem = async (req, res, next) => {

  const validationErrors = await validationResult(req);

  if (!req.user.contentManager) {
    try {
      await fs.unlink(req.file.filename, err => {
        if (err) throw err;
      });
      res.status(400).send('You are not allowed to post items!😑');
    } catch (e) {
      console.log(e.message);
      res.status(400).send('You are not allowed to post items!😑');
    }
  } else if (!validationErrors.isEmpty()) {
    const mappederrors = validationErrors.errors.map((error) => {
      return `${error.param} error: ${error.msg}`;
    });
    try {
      await fs.unlink(req.file.filename, err => {
        if (err) throw err;
      });
      res.status(400).send(mappederrors);
    } catch (e) {
      console.log(e.message);
      res.status(400).send(mappederrors);
    }
  } else {
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
      next();
    } catch (e) {
      console.log(e);
      res.status(400).send('Failed to upload 😥');
    }
  }
};

const insertItemToDb = async (req, res, next) => {
  console.log(req.user);

  res.status(200).send({message: 'Uploaded image to Azure!!🤗'});
};

module.exports = {
  getSecuredItem,
  postItem,
  insertItemToDb,
};