/* eslint global-require: 0  */
const sharedsession = require('express-socket.io-session');
const session = require('express-session');
const chatctrl = require('./controller/chat');

// RabbitMQ
const publisher = require('./publisher');

let io;

function start(http, sessionConfig) {
  io = require('socket.io')(http);

  // Socket.io
  io.use(sharedsession(session(sessionConfig), {
    autoSave: true,
  }));

  io.on('connection', (socket) => {
    console.log('user connected');
    const sender = socket.handshake.session.username;

    socket.on('subscribe', () => {
      const { room } = socket.handshake.session;
      console.log('joining room', room);
      socket.join(room);

      chatctrl.getRoomHistory(room, (err, msgs) => {
        if (err) {
          console.log(err);
          io.emit('chat history', ['Error retrieving chat history']);
          return;
        }

        if (msgs.length) {
          io.to(`${socket.id}`)
            .emit(
              'chat history',
              msgs.reverse().map((m) => `[${m.createdAt}] ${m.sender.name}: ${m.message}`),
            );
        }
      });
    });

    socket.on('unsubscribe', () => {
      const { room } = socket.handshake.session;
      console.log('leaving room', room);
      socket.leave(room);
    });

    socket.on('chat message', (data) => {
      const { room } = socket.handshake.session;
      if (data.msg.startsWith('/stock=')) {
        const stock = data.msg.split('=')[1];
        publisher.addToQueue(stock, room);
        return;
      }

      // Save chat to the database
      const { token } = socket.handshake.session;
      chatctrl.saveMessage(room, data.msg, token, (error, msg) => {
        if (error) {
          console.log(error);
          io.to(`${socket.id}`)
            .emit('chat error', 'SystemBot: Invalid token. Please login again to start chatting again.');
          return;
        }

        io.sockets.in(room).emit('chat message', `[${msg.createdAt}] ${sender}: ${data.msg}`);
      });
    });
  });
}

function emitEvent(room, event, msg) {
  io.sockets.in(room).emit(`${event}`, `${msg}`);
}

function emitToSocket(socketId, event, msg) {
  io.to(`${socketId}`).emit(`${event}`, `${msg}`);
}

module.exports = {
  start,
  emitEvent,
  emitToSocket,
};
