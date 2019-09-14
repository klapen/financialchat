const express		= require('express');
const session           = require('express-session')
const bodyParser	= require('body-parser');
const router		= express.Router();
const app		= express();
const http		= require('http').createServer(app);
const io		= require('socket.io')(http);
const redis		= require('redis');
const redisStore        = require('connect-redis')(session);
const client		= redis.createClient();
const sharedsession     = require("express-socket.io-session");

const port = process.env.PORT || '3000';
const secret = process.env.SECRET || 'aSu8TL/~I?T3PMg7OJ;i9FU\iaep2BS1&SaJ83rGP#3J7&T#?ftf,5,9|YJ64';


// Database connection
const Chat = require('./models/finchat');
const connect = require('./dbconn');

// Redis
const store = new redisStore({
    host: process.env.REDIS_SERVER || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    client: client,
    ttl : process.env.REDIS_TTL || 260
});
const sessionConfig = {
    secret,
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
app.use(express.static(__dirname + "/public"));

router.get('/chat', function(req, res){
    let sess = req.session;
    if(!sess.email) {
        return res.redirect('/');
    }
    res.sendFile(__dirname + '/public/chat.html');
});

// Login
router.get('/', (req,res) => {
    res.sendFile(__dirname + '/public/login.html');    
});

const users = {
    'admin@admin.com':{
	name: 'Admin',
	pass: '12345'
    },
    'user@user.com':{
	name: 'User',
	pass: '54321'
    }
}

router.post('/', (req,res) => {
    const email = req.body.email;
    if(!users[email]) {
	res.json({ error: 'User not found'});
	return;
    }

    const pass = req.body.pass;
    if(users[email].pass !== pass)  {
	res.json({ error: 'Invalid password'});
	return;
    }

    let sess = req.session;
    sess.email = req.body.email;
    sess.username = users[email].name;
    res.json({ token: 'weqweqe' });
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

    socket.on('subscribe', function(room) {
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
			    msgs.reverse().map( m => `${m.sender}: ${m.message}`)
			);
		}
	    });
    });

    socket.on('unsubscribe', function(room) {
        console.log('leaving room', room);
        socket.leave(room);
    });

    socket.on('chat message', function(data){
	if(data.msg.startsWith('/stock=')){
	    const stock = data.msg.split('=')[1];
	    publisher.addToQueue(stock, data.room);
	    return;
	}
	io.sockets.in(data.room).emit('chat message', `${sender}: ${data.msg}`);

	// Save chat to the database
	connect.then(db => {
	    let chatMessage = new Chat({ message: data.msg, sender, room: data.room });
	    
	    chatMessage.save();
	}).catch(err => {
	    console.log(`Error - DB connection: ${err}`)
	});
    });
});

http.listen(port, function(){
    console.log(`Listening on *:${port}`);
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
