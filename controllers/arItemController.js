'use strict';

const getSecuredItem = async (req, res) => {
  res.status(200).send({message: 'Get secured item'});
};

module.exports = {
  getSecuredItem,
};