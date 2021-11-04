'use strict';

const get_message = async (req, res, next) => {
  console.log(req);
  res.status(200).send({message: "get_message"});
};

const post_user = async (req, res, next) => {
  console.log(req);
  res.status.send({message: "post_user"})
}


module.exports = {
  get_message,
  post_user,
}