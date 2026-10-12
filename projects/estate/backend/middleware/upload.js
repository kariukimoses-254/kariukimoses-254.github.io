const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = './uploads/properties';
    if (file.fieldname === 'avatar') {
      uploadPath = './uploads/avatars';
    } else if (file.fieldname === 'document') {
      uploadPath = './uploads/documents';
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };

  const allAllowed = [...allowedTypes.image, ...allowedTypes.video, ...allowedTypes.document];

  if (allAllowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024
  }
});

const uploadPropertyImages = upload.array('images', 20);
const uploadPropertyVideos = upload.array('videos', 5);
const uploadAvatar = upload.single('avatar');
const uploadDocument = upload.single('document');
const uploadMixed = upload.fields([
  { name: 'images', maxCount: 20 },
  { name: 'videos', maxCount: 5 },
  { name: 'document', maxCount: 5 }
]);

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'File size exceeds the limit of 10MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        status: 'error',
        message: 'Too many files uploaded'
      });
    }
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
  if (err.message === 'File type not allowed') {
    return res.status(400).json({
      status: 'error',
      message: 'File type not allowed. Allowed types: JPEG, PNG, GIF, WebP, MP4, PDF, DOC'
    });
  }
  next(err);
};

module.exports = {
  uploadPropertyImages,
  uploadPropertyVideos,
  uploadAvatar,
  uploadDocument,
  uploadMixed,
  handleUploadError
};
