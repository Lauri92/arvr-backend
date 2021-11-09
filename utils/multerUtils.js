'use strict'

const mediaFileFilter = (req, file, cb) => {
  console.log(`fileFilter file: ${file.mimetype}`);
  // Only accept images and videos
  try {
    if (file.mimetype.includes('image') || file.mimetype.includes('video')) {
      return cb(null, true);
    } else {
      return cb(null, false, new Error('not an image or video'));
    }
  } catch (e) {
    console.log(e.message);
  }
};
module.exports = {
  mediaFileFilter
}