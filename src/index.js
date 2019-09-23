const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const router = express.Router();
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const redis = require('redis');
const RedisStore = require('connect-redis')(session);

const client = redis.createClient();
const sharedsession = require('express-socket.io-session');
const auth = require('./middleware/auth');
const config = require('./config');
const utils = require('./utils');

// Controllers
const userctrl = require('./controller/user');
const chatctrl = require('./controller/chat');
const connect = require('./dbconn');

// Redis
const store = new RedisStore({
  host: config.redis.server,
  port: config.redis.port,
  client,
  ttl: config.redis.ttl,
});
const sessionConfig = {
  secret: config.secret,
  store,
  saveUninitialized: true,
  resave: true,
};

// RabbitMQ
const worker = require('./worker');
const publisher = require('./publisher');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session(sessionConfig));
app.use(express.static(`${__dirname}/public`));

// Chat - ToDo: change to ./routers/chat.js
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
    utils.decodeToken(token, (err, decoded) => {
      if (err) {
        console.log(`Error -> Token decoding: ${err}`);
        io.to(`${socket.id}`).emit('chat error', 'SystemBot: Invalid token. Please login again to start chatting again.');
        return;
      }
      const userId = decoded._id;

      chatctrl.saveMessage(room, data.msg, userId, (error, msg) => {
        if (error) {
          console.log(error);
          return;
        }

        io.sockets.in(room).emit('chat message', `[${msg.createdAt}] ${sender}: ${data.msg}`);
      });
    });
  });
});

connect.then(() => {
  http.listen(config.port, () => {
    console.log(`Listening on *:${config.port}`);
    worker.start((room, msg) => {
      io.sockets.in(room).emit('chat message', msg);
    });
  });

  process.on('exit', () => {
    worker.stop(() => {
      console.log('Closing rabbitmq channel and connection');
    });
  });

  app.use('/', router);
}).catch((errDB) => {
  console.log(`Error -> DB connection: ${errDB}`);
});
