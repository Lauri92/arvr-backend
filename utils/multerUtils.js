const multer = require('multer');
const fs = require('fs');

// Check that uploaded file is an image
const uploadSingle = multer({
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

// Check the filetypes of uploaded 3D items, gltf, bin and images are accepted
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
      if (file.mimetype.includes('octet-stream') ||
          file.mimetype.includes('application/macbinary')) {
        return cb(null, true);
      } else {
        return cb(null, false, new Error('Not a bin file!'));
      }
    } else if (file.fieldname === 'gltf') {
      console.log(file);
      if (file.mimetype.includes('gltf') ||
          file.mimetype.includes('application/octet-stream')) {
        return cb(null, true);
      } else {
        return cb(null, false, new Error('Not a gltf file!'));
      }
    } else if (file.fieldname === 'logoImageReference') {
      if (file.mimetype.includes('image')) {
        return cb(null, true);
      } else {
        return cb(null, false, new Error('Not an image!'));
      }
    } else {
      return cb(null, false, new Error('Wrong file type!!'));
    }
  }, onError: function(err, next) {
    console.log('error', err);
    next(err);
  },
});

// Set a value for the body's file property if the filefilter for image passed
const injectFile = (req, res, next) => {
  if (req.file) {
    req.body.type = req.file.mimetype;
  }
  next();
};

// Set a value for the body's file property if filefilter for 3D object passed
const inject3dFileTypes = async (req, res, next) => {

  const matchingFiles = await checkGltfRequirements(req);
  if (req.files['gltf'] && req.files['bin'] &&
      req.files['logoImageReference'] && matchingFiles) {
    console.log('Nothing is wrong!');
    req.body.type = '3dObject';
  } else {
    console.log('Something is wrong!');
  }
  next();
};

// Check that uploaded files match the requirements in the gltf file json
const checkGltfRequirements = async (req) => {
  try {
    if (`uploads/${req.files['gltf'][0].filename}`) {
      const contents = fs.readFileSync(
          `uploads/${req.files['gltf'][0].filename}`).toString();
      const gltfInfo = JSON.parse(contents);

      let requiredImages = [];
      let submittedImages = [];
      if (req.files['imageGallery']) {
        requiredImages = gltfInfo.images.map((image) => {
          return image.uri;
        }).sort().toString().replace(/%20/g, ' ');
        submittedImages = req.files['imageGallery'].map((image) => {
          return image.originalname;
        }).sort().toString().replace(/%20/g, ' ');
      }
      const requiredBin = gltfInfo.buffers[0].uri.toString().
          replace(/%20/g, ' ');
      const submittedBin = req.files['bin'].map((bin) => {
        return bin.originalname;
      }).sort().toString().replace(/%20/g, ' ');

      return requiredImages.toString() === submittedImages.toString() &&
          requiredBin === submittedBin;
    } else {
      return false;
    }
  } catch (e) {
    console.log(e);
    return false;
  }
};

module.exports = {
  uploadSingle,
  upload3d,
  injectFile,
  inject3dFileTypes,
};