const mongoose = require('mongoose');
const checkEnvironment = (app) => {
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