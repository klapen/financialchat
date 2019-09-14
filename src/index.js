const config            = require('./config');
const express		= require('express');
const session           = require('express-session');
const bodyParser	= require('body-parser');
const router		= express.Router();
const app		= express();
const http		= require('http').createServer(app);
const io		= require('socket.io')(http);
const redis		= require('redis');
const redisStore        = require('connect-redis')(session);
const client		= redis.createClient();
const sharedsession     = require('express-socket.io-session');
const auth		= require('./middleware/auth');
const bcrypt		= require('bcrypt');
const utils		= require('./utils');

// Database connection
const { User, validate } = require('./models/user');
const Chat = require('./models/finchat');

const connect = require('./dbconn');

// Redis
const store = new redisStore({
    host: config.redis.server,
    port: config.redis.port,
    client: client,
    ttl: config.redis.ttl
});
const sessionConfig = {
    secret: config.secret,
    store,
    saveUninitialized: true,
    resave: true
};

// RabbitMQ
const worker = require('./worker');
const publisher = require('./publisher');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session(sessionConfig));
app.use(express.static(__dirname + '/public'));

router.get('/chat', auth, function(req, res){
    let sess = req.session;
    if(!req.user) {
        return res.redirect('/');
    }
    res.sendFile(__dirname + '/public/chat.html');
});

// Login
router.get('/', (req,res) => {
    res.sendFile(__dirname + '/public/login.html');    
});

router.post('/', (req, res) => {
    const email = req.body.email;
    const pass = req.body.pass;
    const room = req.body.room;

    if(!room && room.length < 3){
	res.json({ error: 'Room can not be empty or less than 3 characters'});
	return;
    }

    if(!email && !pass){
	res.json({ error: 'Email and password are required'});
	return;
    }

    if(!utils.validateEmail(email)){
	res.json({ error: 'Invalid email'});
	return;
    }

    bcrypt.hash(pass, 10)
	.then(password => {
	    User.findOne({email})
		.then(user => {
		    if(!user){
			res.json({ error: 'User not found'});
			return;
		    }

		    bcrypt.compare(pass, user.password)
			.then(isMatch => {
			    if(!isMatch){
				res.json({ error: 'Incorrect password'});
				return;
			    };
			    
			    let sess = req.session;
			    sess.email = user.email;
			    sess.username = user.name;
			    sess.room = room;

			    const token = user.generateAuthToken();
			    sess.token = token;
			    res.json({ token });
			}).catch(err =>{
			    console.log(`Error -> Bcrypt compare: ${err}`)
			    res.json({ error: 'Error comparing the passwords'});
			})
		}).catch(err =>{
		    console.log(`Error -> User find: ${err}`)
		    res.json({ error: 'Error on the database'});
		}); 
	}).catch(err =>{
	    console.log(`Error -> Bcrypt: ${err}`)
	    res.json({ error: 'Error getting the password encryption'});
	}); 
});

router.get('/logout',(req,res) => {
    req.session.destroy((err) => {
        if(err) {
            return console.log(`Error -> Logout: ${err}`);
        }
        res.redirect('/');
    });

});

// Socket.io
io.use(sharedsession( session(sessionConfig), {
    autoSave:true
})); 

io.on('connection', function(socket){
    console.log('user connected');
    const sender = socket.handshake.session.username;

    socket.on('subscribe', function() {
	const room = socket.handshake.session.room;
        console.log('joining room', room);
        socket.join(room);
	Chat.find({ room }).sort({'createdAt': -1}).limit(50)
	    .exec(function(err, msgs){
		if(err){
		    console.log(`Error -> Chat find: ${err}`);
		    io.emit('chat history', ['Error retrieving chat history']);
		    return;
		}

		if(msgs.length){
		    io.to(`${socket.id}`)
			.emit(
			    'chat history',
			    msgs.reverse().map( m => `[${m.createdAt}] ${m.sender}: ${m.message}`)
			);
		}
	    });
    });

    socket.on('unsubscribe', function() {
	const room = socket.handshake.session.room;
        console.log('leaving room', room);
        socket.leave(room);
    });

    socket.on('chat message', function(data){
	const room = socket.handshake.session.room;
	if(data.msg.startsWith('/stock=')){
	    const stock = data.msg.split('=')[1];
	    publisher.addToQueue(stock, room);
	    return;
	}

	// Save chat to the database
	connect.then(db => {
	    let chatMessage = new Chat({ message: data.msg, sender, room });
	    
	    chatMessage.save().then(msg =>{
		io.sockets.in(room).emit('chat message', `[${msg.createdAt}] ${sender}: ${data.msg}`);
	    });
	}).catch(err => {
	    console.log(`Error - DB connection: ${err}`)
	});
    });
});

http.listen(config.port, function(){
    console.log(`Listening on *:${config.port}`);
    worker.start((room, msg) =>{
	io.sockets.in(room).emit('chat message', msg);
    });
});

process.on('exit', (code) => {
    channel.close();
    connection.close();
    console.log(`Closing rabbitmq channel and connection`);
});

app.use('/', router);
