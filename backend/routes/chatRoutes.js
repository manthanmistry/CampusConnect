const express = require('express');
const { body } = require('express-validator');
const {
  getMatchesForItem,
  createOrGetChat,
  getMyChats,
  getChatById,
  addMessage,
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/matches/:itemId', getMatchesForItem);

router.post(
  '/',
  [body('itemId').notEmpty().withMessage('Item ID is required')],
  createOrGetChat
);

router.get('/', getMyChats);
router.get('/:id', getChatById);

router.post(
  '/:id/messages',
  [body('text').trim().notEmpty().withMessage('Message is required')],
  addMessage
);

module.exports = router;
