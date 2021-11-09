'use strict';

const getSecuredItem = async (req, res) => {
  res.status(200).send({message: 'Get secured item'});
};

const postItem = async (req, res) => {
  //console.log(req.file);
  res.status(200).send({message: 'Post image here!'});
};

module.exports = {
  getSecuredItem,
  postItem,
};