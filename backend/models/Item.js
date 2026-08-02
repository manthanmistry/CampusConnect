const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Electronics',
        'Documents',
        'Accessories',
        'Clothing',
        'Books',
        'Keys',
        'Bags',
        'ID Cards',
        'Wallets',
        'Other',
      ],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: ['Lost', 'Found'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    color: {
      type: String,
      trim: true,
      default: '',
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    claimStatus: {
      type: String,
      enum: ['Available', 'Claimed', 'Returned'],
      default: 'Available',
    },
  },
  { timestamps: true }
);

itemSchema.index({ category: 1 });
itemSchema.index({ status: 1 });
itemSchema.index({ location: 1 });
itemSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Item', itemSchema);
