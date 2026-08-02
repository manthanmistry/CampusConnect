const express = require('express');
const {
  getAllUsers,
  deleteUser,
  getDashboardStats,
  markReturned,
  adminDeleteItem,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

const router = express.Router();

router.use(protect, admin);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/items/:id/return', markReturned);
router.delete('/items/:id', adminDeleteItem);

module.exports = router;
