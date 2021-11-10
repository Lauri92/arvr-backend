const multer = require('multer');

const upload = multer({
  dest: './',
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes('image')) {
      return cb(null, true);
    } else {
      return cb(null, false, new Error('not an image'));
    }
  }, onError: function(err, next) {
    console.log('error', err);
    next(err);
  },
});

const injectFile = (req, res, next) => {
  if (req.file) {
    req.body.type = req.file.mimetype;
  }
  next();
};

module.exports = {
  upload,
  injectFile,
};