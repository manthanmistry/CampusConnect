const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const Item = require('../models/Item');
const Claim = require('../models/Claim');

// @desc    Create a new Lost/Found item report
// @route   POST /api/items
// @access  Private
const createItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, category, status, location, date, color, brand } = req.body;

    const item = await Item.create({
      title,
      description,
      category,
      status,
      location,
      date,
      color,
      brand,
      image: req.file ? req.file.filename : '',
      reportedBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Item reported successfully', data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all items with search/filter/pagination
// @route   GET /api/items
// @access  Public
const getItems = async (req, res, next) => {
  try {
    const { search, category, status, claimStatus, location, mine } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) query.category = category;
    if (status) query.status = status;
    if (claimStatus) query.claimStatus = claimStatus;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (mine && req.user) query.reportedBy = req.user._id;

    const items = await Item.find(query)
      .populate('reportedBy', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single item by ID
// @route   GET /api/items/:id
// @access  Public
const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate('reportedBy', 'name email phone');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an item (owner only)
// @route   PUT /api/items/:id
// @access  Private
const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this item' });
    }

    const fields = ['title', 'description', 'category', 'status', 'location', 'date', 'color', 'brand', 'claimStatus'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) item[field] = req.body[field];
    });

    if (req.file) {
      // Remove old image if it exists
      if (item.image) {
        const oldPath = path.join(__dirname, '..', 'uploads', item.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      item.image = req.file.filename;
    }

    const updatedItem = await item.save();
    res.status(200).json({ success: true, message: 'Item updated successfully', data: updatedItem });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an item (owner or admin)
// @route   DELETE /api/items/:id
// @access  Private
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this item' });
    }

    if (item.image) {
      const imgPath = path.join(__dirname, '..', 'uploads', item.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await Claim.deleteMany({ itemId: item._id });
    await item.deleteOne();

    res.status(200).json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createItem, getItems, getItemById, updateItem, deleteItem };
