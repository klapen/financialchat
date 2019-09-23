const express = require('express');
const sockets = require('./sockets');

const router = express.Router();

const utils = require('./utils');
const auth = require('./middleware/auth');
const userctrl = require('./controller/user');
const chatctrl = require('./controller/chat');

router.get('/chat', auth, (req, res) => {
  if (!req.user) {
    return res.redirect('/');
  }
  return res.sendFile(`${__dirname}/public/chat.html`);
});

// Login - ToDo: change to ./routers/login.js
router.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/login.html`);
});

router.post('/message', auth, (req, res) => {
  if (req.user.role === 'bot') {
    if (req.body.message.startsWith('/stock=')) {
      // Discard message to avoid infinite loop
      res.status(200);
      return;
    }

    sockets.emitEvent(req.body.room, 'chat message', req.body.message);
    res.status(200).send('Message recieved');
    return;
  }

  chatctrl.saveMessage(req.body.room, req.body.message, req.user.token, (error, msg) => {
    if (error) {
      console.log(error);
      sockets.emitToSocket(req.body.socketId, 'chat error', 'SystemBot: Invalid token. Please login again to start chatting again.');
      return;
    }

    sockets.emitEvent(req.body.room, 'chat message', `[${msg.createdAt}] ${req.user.name}: ${msg.message}`);
  });
});

// LOGIN:
router.post('/', (req, res) => {
  const { email, pass, room } = req.body;

  if (!room && room.length < 3) {
    res.json({ error: 'Room can not be empty or less than 3 characters' });
    return;
  }

  if (!email && !pass) {
    res.json({ error: 'Email and password are required' });
    return;
  }

  if (!utils.validateEmail(email)) {
    res.json({ error: 'Invalid email' });
    return;
  }

  userctrl.getLoginUser(email, pass, (err, user) => {
    if (err) {
      res.json({ error: 'Error on the database' });
      return;
    }

    const sess = req.session;
    sess.email = user.email;
    sess.username = user.name;
    sess.room = room;

    const token = user.generateAuthToken();
    sess.token = token;
    res.json({ token });
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(`Error -> Logout: ${err}`);
      return;
    }
    res.redirect('/');
  });
});

module.exports = router;
