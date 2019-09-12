const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FinChatSchema = new Schema(
  {
      message: {
	  type: String
      },
      sender: {
	  type: String
      },
      room: {
	  type: String
      }
  },
    {
	timestamps: true
    }
);

let FinChat = mongoose.model('FinChat', FinChatSchema);

module.exports = FinChat;
