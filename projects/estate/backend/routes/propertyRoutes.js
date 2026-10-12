const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const propertyController = require('../controllers/propertyController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/errorHandler');
const { uploadPropertyImages, uploadPropertyVideos, handleUploadError } = require('../middleware/upload');

router.get('/', optionalAuth, propertyController.getAllProperties);
router.get('/featured', propertyController.getFeaturedProperties);
router.get('/types', propertyController.getPropertyTypes);
router.get('/categories', propertyController.getPropertyCategories);
router.get('/amenities', propertyController.getAmenities);
router.get('/user/favorites', authenticate, propertyController.getFavorites);
router.get('/:id', optionalAuth, propertyController.getPropertyById);

router.post('/', authenticate, authorize('agent', 'admin'), uploadPropertyImages, handleUploadError, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('type_id').isInt().withMessage('Property type is required'),
  body('category_id').isInt().withMessage('Property category is required')
], validate, propertyController.createProperty);

router.put('/:id', authenticate, authorize('agent', 'admin'), uploadPropertyImages, handleUploadError, propertyController.updateProperty);
router.delete('/:id', authenticate, authorize('agent', 'admin'), propertyController.deleteProperty);

router.post('/:property_id/favorite', authenticate, propertyController.toggleFavorite);

module.exports = router;
