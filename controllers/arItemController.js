'use strict';

const getSecuredItem = async (req, res) => {
  console.log(req.user.tokenUser.id);
  console.log(req.headers.authorization);
  res.status(200).send({message: 'Get secured item'});
};

module.exports = {
  getSecuredItem,
};