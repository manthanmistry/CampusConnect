const express = require('express');
const { body } = require('express-validator');
const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
} = require('../controllers/itemController');
const { protect } = require('../middleware/auth');
const { optionalAuth } = require('../middleware/optionalAuth');
const upload = require('../middleware/upload');

const router = express.Router();

const itemValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('status').isIn(['Lost', 'Found']).withMessage('Status must be Lost or Found'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('date').notEmpty().withMessage('Date is required'),
];

router
  .route('/')
  .get(optionalAuth, getItems)
  .post(protect, upload.single('image'), itemValidation, createItem);

router
  .route('/:id')
  .get(getItemById)
  .put(protect, upload.single('image'), updateItem)
  .delete(protect, deleteItem);

module.exports = router;
