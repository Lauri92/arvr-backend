const multer = require('multer');
const fs = require('fs');

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

const inject3dFileTypes = async (req, res, next) => {

  const matchingFiles = await checkGltfRequirements(req);
  if (req.files['gltf'] && req.files['bin'] && req.files['imageGallery'] &&
      matchingFiles) {
    console.log('Nothing is wrong!');
    req.body.type = '3dObject';
  } else {
    console.log('Something is wrong!');
  }
  next();
};

const checkGltfRequirements = async (req) => {
  try {
    if (`uploads/${req.files['gltf'][0].filename}`) {
      const contents = fs.readFileSync(
          `uploads/${req.files['gltf'][0].filename}`).toString();
      const gltfInfo = JSON.parse(contents);

      const requiredImages = gltfInfo.images.map((image) => {
        return image.uri;
      }).sort().toString();
      const submittedImages = req.files['imageGallery'].map((image) => {
        return image.originalname;
      }).sort().toString();

      const requiredBin = gltfInfo.buffers[0].uri.toString();
      const submittedBin = req.files['bin'].map((bin) => {
        return bin.originalname;
      }).sort().toString();

      return requiredImages === submittedImages && requiredBin === submittedBin;
    } else {
      return false;
    }
  } catch (e) {
    console.log(e.message);
    return false;
  }
};

module.exports = {
  uploadSingle,
  upload3d,
  injectFile,
  inject3dFileTypes,
};