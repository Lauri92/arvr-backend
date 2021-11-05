'use strict';
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const authRoute = require('./routes/authRoute');

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('.')); // for index.html

//require('./localhost')(app, process.env.HTTPS_PORT, process.env.HTTP_PORT);
//const PORT = process.env.PORT || 5000;
//app.listen(PORT, () => console.log(`listening on ${PORT}`));
//console.log('App started on localhost.');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
if (process.env.NODE_ENV === 'production') {
  require('./production')(app, process.env.PORT);
} else {
  //require('./localhost')(app, process.env.HTTPS_PORT, process.env.HTTP_PORT);
  app.listen(8000);
  const d = new Date(); // for now
  console.log(
      `Started on localhost @ ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`);
}
app.get('/', (req, res) => {
  res.send('Hello Secure World!');
});

app.use('/auth', authRoute);