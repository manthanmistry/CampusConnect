const express = require('express');
const { body } = require('express-validator');
const { createClaim, getClaims, updateClaim } = require('../controllers/claimController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

const router = express.Router();

router.post(
  '/',
  protect,
  [
    body('itemId').notEmpty().withMessage('Item ID is required'),
    body('reason').trim().notEmpty().withMessage('Reason is required'),
    body('contactNumber').trim().notEmpty().withMessage('Contact number is required'),
  ],
  createClaim
);

router.get('/', protect, getClaims);
router.put('/:id', protect, admin, updateClaim);

module.exports = router;
