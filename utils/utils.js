const mongoose = require('mongoose');
const checkEnvironment = (app) => {
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  if (process.env.NODE_ENV === 'production') {
    require('../production')(app, process.env.PORT);
  } else {
    //require('./localhost')(app, process.env.HTTPS_PORT, process.env.HTTP_PORT);
    app.listen(8000);
    const d = new Date(); // for now
    console.log(
        `Started on localhost @ ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`);
  }
};
const initializeMongoose = async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/arvr_db');
};

module.exports = {
  checkEnvironment,
  initializeMongoose,
};