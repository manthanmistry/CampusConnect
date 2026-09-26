const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  }
);

const chatSchema = new mongoose.Schema(
  {
    /*
     * The item from which the chat was started.
     */
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },

    /*
     * matchedItemId is no longer required.
     *
     * It is kept as an optional field so that any old
     * chats created using the previous matching system
     * continue to work.
     */
    matchedItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: false,
    },

    /*
     * The two users participating in the conversation.
     *
     * User 1 = person who starts the chat
     * User 2 = person who reported the item
     */
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],

    /*
     * Messages inside the conversation.
     */
    messages: [messageSchema],

    /*
     * Used to show the newest conversations first.
     */
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Index for finding chats belonging to users.
 */
chatSchema.index({
  participants: 1,
  itemId: 1,
});

/*
 * Index for sorting chats by latest message.
 */
chatSchema.index({
  lastMessageAt: -1,
});

module.exports = mongoose.model('Chat', chatSchema);