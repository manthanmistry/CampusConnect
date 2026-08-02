require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');

const seed = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await Claim.deleteMany();
    await Item.deleteMany();
    await User.deleteMany();

    console.log('Creating admin account...');
    const admin = await User.create({
      name: process.env.ADMIN_NAME || 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@campusconnect.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      phone: '9999999999',
      role: 'admin',
    });

    console.log('Creating sample students...');
    const students = await User.create([
      { name: 'Aarav Sharma', email: 'aarav@campus.edu', password: 'Student@123', phone: '9876543210', role: 'student' },
      { name: 'Priya Patel', email: 'priya@campus.edu', password: 'Student@123', phone: '9876543211', role: 'student' },
      { name: 'Rohan Mehta', email: 'rohan@campus.edu', password: 'Student@123', phone: '9876543212', role: 'student' },
    ]);

    console.log('Creating sample items...');
    const items = await Item.create([
      {
        title: 'Black Dell Laptop',
        description: 'Dell Inspiron 15 laptop with a cracked sticker on the lid, left in the library study room.',
        category: 'Electronics',
        status: 'Lost',
        location: 'Central Library',
        date: new Date('2026-07-20'),
        color: 'Black',
        brand: 'Dell',
        reportedBy: students[0]._id,
      },
      {
        title: 'Blue Water Bottle',
        description: 'Steel water bottle with a college logo sticker, found near the basketball court.',
        category: 'Other',
        status: 'Found',
        location: 'Sports Complex',
        date: new Date('2026-07-22'),
        color: 'Blue',
        brand: 'Milton',
        reportedBy: students[1]._id,
      },
      {
        title: 'Student ID Card - Rohan',
        description: 'Found an ID card near the cafeteria entrance.',
        category: 'ID Cards',
        status: 'Found',
        location: 'Cafeteria',
        date: new Date('2026-07-23'),
        reportedBy: students[2]._id,
      },
      {
        title: 'Brown Leather Wallet',
        description: 'Lost my wallet somewhere between the parking lot and the main building.',
        category: 'Wallets',
        status: 'Lost',
        location: 'Parking Lot',
        date: new Date('2026-07-21'),
        color: 'Brown',
        reportedBy: students[0]._id,
      },
      {
        title: 'Set of Keys with Keychain',
        description: 'Found a set of 3 keys with a small red keychain near Block C.',
        category: 'Keys',
        status: 'Found',
        location: 'Block C',
        date: new Date('2026-07-24'),
        reportedBy: students[1]._id,
      },
    ]);

    console.log('Creating sample claims...');
    await Claim.create([
      {
        itemId: items[1]._id,
        studentId: students[2]._id,
        reason: 'This is my water bottle, it has my name engraved on the bottom.',
        contactNumber: '9876543212',
        status: 'Pending',
      },
    ]);

    console.log('\nSeed data created successfully!');
    console.log('----------------------------------');
    console.log(`Admin Login: ${admin.email} / ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    console.log('Student Login: aarav@campus.edu / Student@123');
    console.log('----------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
