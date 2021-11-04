'use strict';

const user_create_post = async (req, res, next) => {
  console.log(req);
  res.status(200).send({message: "get_user"});
};

module.exports = {
  user_create_post,
}