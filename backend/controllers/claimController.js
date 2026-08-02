const { validationResult } = require('express-validator');
const Claim = require('../models/Claim');
const Item = require('../models/Item');

// @desc    Create a claim on an item
// @route   POST /api/claims
// @access  Private
const createClaim = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { itemId, reason, contactNumber } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.reportedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot claim your own reported item' });
    }

    if (item.claimStatus !== 'Available') {
      return res.status(400).json({ success: false, message: 'This item is no longer available for claiming' });
    }

    const existingClaim = await Claim.findOne({
      itemId,
      studentId: req.user._id,
      status: 'Pending',
    });
    if (existingClaim) {
      return res.status(400).json({ success: false, message: 'You already have a pending claim on this item' });
    }

    const claim = await Claim.create({
      itemId,
      studentId: req.user._id,
      reason,
      contactNumber,
    });

    res.status(201).json({ success: true, message: 'Claim submitted successfully', data: claim });
  } catch (error) {
    next(error);
  }
};

// @desc    Get claims (own claims for students, all for admin, or by item)
// @route   GET /api/claims
// @access  Private
const getClaims = async (req, res, next) => {
  try {
    const query = {};

    if (req.user.role !== 'admin') {
      query.studentId = req.user._id;
    }

    if (req.query.itemId) query.itemId = req.query.itemId;
    if (req.query.status) query.status = req.query.status;

    const claims = await Claim.find(query)
      .populate({
        path: 'itemId',
        select: 'title category status image claimStatus reportedBy',
        populate: { path: 'reportedBy', select: 'name email' },
      })
      .populate('studentId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: claims.length, data: claims });
  } catch (error) {
    next(error);
  }
};

// @desc    Update claim status (approve/reject) - admin only
// @route   PUT /api/claims/:id
// @access  Private/Admin
const updateClaim = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid claim status' });
    }

    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    claim.status = status;
    await claim.save();

    const item = await Item.findById(claim.itemId);
    if (item) {
      if (status === 'Approved') {
        item.claimStatus = 'Claimed';
        await item.save();
        // Reject other pending claims for the same item
        await Claim.updateMany(
          { itemId: item._id, _id: { $ne: claim._id }, status: 'Pending' },
          { status: 'Rejected' }
        );
      } else if (status === 'Rejected' && item.claimStatus === 'Claimed') {
        item.claimStatus = 'Available';
        await item.save();
      }
    }

    res.status(200).json({ success: true, message: `Claim ${status.toLowerCase()} successfully`, data: claim });
  } catch (error) {
    next(error);
  }
};

module.exports = { createClaim, getClaims, updateClaim };
