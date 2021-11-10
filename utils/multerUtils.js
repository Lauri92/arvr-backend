const multer = require('multer');

const upload = multer({
  dest: './',
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes('image')) {
      console.log('was image!');
      console.log('upload file: ', file);
      return cb(null, true);
    } else {
      return cb(null, false, new Error('not an image'));
    }
  }, onError: function(err, next) {
    console.log('error', err);
    next(err);
  },
});

const injectFile = async (req, res, next) => {
  console.log('injectFile req.file: ', req.file);
  if (req.file) {
    req.body.type = req.file.mimetype;
  }
  console.log('inject', req.body.type);
  next();
};

module.exports = {
  upload,
  injectFile,
};