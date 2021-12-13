const mongoose = require('mongoose');
const checkEnvironment = (app) => {
  // No NODE_ENV -> start in localhost,
  // no PORT ENV -> start in CentOS for testing environment,
  // PORT is defined -> Start in Azure
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.PORT) {
      app.listen(3000);
      console.log('App started on remote server (centOs)');
    } else {
      const PORT = process.env.PORT;
      app.listen(PORT, () => console.log(`listening on ${PORT} (azure)`));
    }
  } else {
    app.listen(8000);
    const d = new Date(); // for now
    console.log(
        `Started on localhost @ ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`);
  }
};
const initializeMongoose = async () => {
  await mongoose.connect(process.env.MONGOOSECONN);
};

module.exports = {
  checkEnvironment,
  initializeMongoose,
};