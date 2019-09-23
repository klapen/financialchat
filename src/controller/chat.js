const Chat = require('../models/finchat');
const utils = require('../utils');

function getRoomHistory(room, cb) {
  Chat.find({ room }).sort({ createdAt: -1 }).limit(50).populate('sender')
    .exec((err, msgs) => {
      if (err) {
        cb(`Error -> Chat find: ${err}`);
        return;
      }

      cb(null, msgs);
    });
}

function saveMessage(room, msg, token, cb) {
  utils.decodeToken(token, (err, decoded) => {
    if (err) {
      cb(`Error -> Token decoding: ${err}`);
      return;
    }
    const userId = decoded._id;

    const chatMessage = new Chat({
      message: msg,
      sender: userId,
      room,
    });

    chatMessage.save()
      .then((message) => {
        cb(null, message);
      }).catch((error) => {
        cb(`Error -> Chat message save: ${error}`);
      });
  });
}

module.exports = {
  getRoomHistory,
  saveMessage,
};
