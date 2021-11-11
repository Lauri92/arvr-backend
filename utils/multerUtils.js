const multer = require('multer');

const uploadSingle = multer({
  dest: './',
  fileFilter: (req, file, cb) => {
    console.log(file);
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
const upload3d = multer({
  dest: './uploads',
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'imageGallery') {
      if (file.mimetype.includes('image')) {
        return cb(null, true);
      } else {
        return cb(null, false, new Error('Not an image!'));
      }
    } else if (file.fieldname === 'bin') {
      if (file.mimetype.includes('octet-stream')) {
        return cb(null, true);
      } else {
        return cb(null, false, new Error('Not a bin file!'));
      }
    } else if (file.fieldname === 'gltf') {
      if (file.mimetype.includes('gltf')) {
        return cb(null, true);
      } else {
        return cb(null, false, new Error('Not a gltf file!'));
      }
    } else {
      return cb(null, false, new Error('Wrong file type!!'));
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

const inject3dFileTypes = (req, res, next) => {
  if (req.files['gltf'] && req.files['bin'] && req.files['imageGallery']) {
    req.body.type = '3dObject';
  } else {
    console.log('not everything is there');
  }
  next();
};

module.exports = {
  uploadSingle,
  upload3d,
  injectFile,
  inject3dFileTypes,
};