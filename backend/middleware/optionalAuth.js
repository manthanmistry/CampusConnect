const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Attaches req.user if a valid token is present, but does NOT block the request otherwise
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Invalid token - proceed as guest
      req.user = null;
    }
  }

  next();
};

module.exports = { optionalAuth };
