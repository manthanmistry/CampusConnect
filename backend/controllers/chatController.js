const Chat = require('../models/Chat');
const Item = require('../models/Item');
const { getMatch } = require('../utils/itemMatcher');

const canAccessChat = (chat, userId) =>
  chat.participants.some(
    (participant) =>
      participant?._id?.toString() === userId.toString() ||
      participant?.toString() === userId.toString()
  );

const itemFields =
  'title description category status location date color brand image claimStatus reportedBy';

/*
 * ============================================================
 * GET MATCHES
 * ============================================================
 */
const getMatchesForItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.itemId).select(
      itemFields
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    const candidates = await Item.find({
      _id: { $ne: item._id },
      status: { $ne: item.status },
      category: item.category,
      reportedBy: { $ne: req.user._id },
      claimStatus: 'Available',
    }).select(itemFields);

    const matches = candidates
      .map((candidate) => ({
        item: candidate,
        ...getMatch(item, candidate),
      }))
      .filter((result) => result.matched)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    res.json({
      success: true,
      matched: matches.length > 0,
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    next(error);
  }
};


/*
 * ============================================================
 * CREATE OR GET CHAT
 * ============================================================
 */
const createOrGetChat = async (req, res, next) => {
  try {
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required',
      });
    }

    const item = await Item.findById(itemId).select(itemFields);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    const currentUserId = req.user._id.toString();
    const ownerId = item.reportedBy.toString();

    if (currentUserId === ownerId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot start a chat from your own report',
      });
    }

    let chat = await Chat.findOne({
      itemId: item._id,
      participants: {
        $all: [req.user._id, item.reportedBy],
      },
    });

    if (!chat) {
      chat = await Chat.create({
        itemId: item._id,
        participants: [
          req.user._id,
          item.reportedBy,
        ],
      });
    }

    chat = await Chat.findById(chat._id)
      .populate(
        'itemId',
        'title image status'
      )
      .populate(
        'matchedItemId',
        'title image status'
      )
      .populate(
        'participants',
        'name email'
      )
      .populate(
        'messages.sender',
        'name'
      );

    res.status(200).json({
      success: true,
      data: chat,
    });
  } catch (error) {
    console.error('CREATE CHAT ERROR:', error);
    next(error);
  }
};


/*
 * ============================================================
 * GET MY CHATS
 * ============================================================
 */
const getMyChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
    })
      .populate(
        'itemId',
        'title image status'
      )
      .populate(
        'matchedItemId',
        'title image status'
      )
      .populate(
        'participants',
        'name email'
      )
      .populate(
        'messages.sender',
        'name'
      )
      .sort({
        lastMessageAt: -1,
      });

    res.status(200).json({
      success: true,
      count: chats.length,
      data: chats,
    });
  } catch (error) {
    next(error);
  }
};


/*
 * ============================================================
 * GET CHAT BY ID
 * ============================================================
 */
const getChatById = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate(
        'itemId',
        'title image status'
      )
      .populate(
        'matchedItemId',
        'title image status'
      )
      .populate(
        'participants',
        'name email'
      )
      .populate(
        'messages.sender',
        'name'
      );

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    if (!canAccessChat(chat, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not allowed to access this chat',
      });
    }

    res.status(200).json({
      success: true,
      data: chat,
    });
  } catch (error) {
    next(error);
  }
};


/*
 * ============================================================
 * ADD MESSAGE
 * ============================================================
 */
const addMessage = async (req, res, next) => {
  try {
    const text = String(
      req.body.text || ''
    ).trim();

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty',
      });
    }

    if (text.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Message is too long',
      });
    }

    const chat = await Chat.findById(
      req.params.id
    );

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    if (!canAccessChat(chat, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not allowed to send messages here',
      });
    }

    const message = {
      sender: req.user._id,
      text,
    };

    chat.messages.push(message);
    chat.lastMessageAt = new Date();

    await chat.save();

    const messageIndex = chat.messages.length - 1;

    /*
     * Populate the nested message correctly.
     * We must populate from the parent Chat document.
     */
    await chat.populate(
      `messages.${messageIndex}.sender`,
      'name'
    );

    const savedMessage = chat.messages[messageIndex];

    /*
     * Send real-time message through Socket.IO.
     */
    const io = req.app.get('io');

    if (io) {
      io.to(`chat:${chat._id}`).emit(
        'newMessage',
        {
          chatId: chat._id,
          message: savedMessage,
        }
      );
    }

    res.status(201).json({
      success: true,
      data: savedMessage,
    });
  } catch (error) {
    console.error('ADD MESSAGE ERROR:', error);
    next(error);
  }
};


/*
 * ============================================================
 * EXPORTS
 * ============================================================
 */
module.exports = {
  getMatchesForItem,
  createOrGetChat,
  getMyChats,
  getChatById,
  addMessage,
};