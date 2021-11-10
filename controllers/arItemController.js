'use strict';
const {BlobServiceClient} = require('@azure/storage-blob');
const storageAccountConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const blobServiceClient = BlobServiceClient.fromConnectionString(
    storageAccountConnectionString);
const fs = require('fs');
const FileType = require('file-type');

const getSecuredItem = async (req, res) => {
  res.status(200).send({message: 'Get secured item'});
};

const postItem = async (req, res) => {
  if (req.file !== undefined) {
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
      res.status(200).send({message: 'Uploaded image to Azure!!'});
    } catch (e) {
      console.log(e);
      res.status(400).send('Failed to upload');
    }
  } else {
    res.status(400).send('Failed to upload');
  }
};

module.exports = {
  getSecuredItem,
  postItem,
};