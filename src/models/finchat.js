const mongoose = require('mongoose');

const { Schema } = mongoose;
const FKHelper = require('../helpers/foreignKey');

const FinChatSchema = new Schema(
  {
    message: {
      type: String,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      validate: {
        isAsync: true,
        validator(v) {
          return FKHelper(mongoose.model('User'), v);
        },
        message: 'User doesn\'t exist',
      },
    },
    room: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const FinChat = mongoose.model('FinChat', FinChatSchema);

module.exports = FinChat;
