const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const http = require('http').createServer(app);
const redis = require('redis');
const RedisStore = require('connect-redis')(session);

const client = redis.createClient();
const config = require('./config');

const router = require('./router');
const sockets = require('./sockets');

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


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session(sessionConfig));
app.use(express.static(`${__dirname}/public`));

connect.then(() => {
  http.listen(config.port, () => {
    console.log(`Listening on *:${config.port}`);
  });
  app.use('/', router);
  sockets.start(http, sessionConfig);
}).catch((errDB) => {
  console.log(`Error -> DB connection: ${errDB}`);
});
