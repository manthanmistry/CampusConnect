const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete an admin account' });
    }
    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalLost, totalFound, pendingClaims, returnedItems, totalClaims] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Item.countDocuments({ status: 'Lost' }),
      Item.countDocuments({ status: 'Found' }),
      Claim.countDocuments({ status: 'Pending' }),
      Item.countDocuments({ claimStatus: 'Returned' }),
      Claim.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: { totalUsers, totalLost, totalFound, pendingClaims, returnedItems, totalClaims },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark an item as Returned
// @route   PUT /api/admin/items/:id/return
// @access  Private/Admin
const markReturned = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    item.claimStatus = 'Returned';
    await item.save();
    res.status(200).json({ success: true, message: 'Item marked as returned', data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a fake/inappropriate report (admin override)
// @route   DELETE /api/admin/items/:id
// @access  Private/Admin
const adminDeleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    if (item.image) {
      const imgPath = path.join(__dirname, '..', 'uploads', item.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    await Claim.deleteMany({ itemId: item._id });
    await item.deleteOne();
    res.status(200).json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, deleteUser, getDashboardStats, markReturned, adminDeleteItem };
