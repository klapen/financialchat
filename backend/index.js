const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const port = process.env.PORT || '3000';

// Database connection
const Chat = require('./models/finchat');
const connect = require('./dbconn');

app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/chat.html');
});

io.on('connection', function(socket){
    console.log('user connected');
    Chat.find().sort({'createdAt': 1}).limit(50)
	.exec(function(err, msgs){
	    if(err){
		console.log(`Error -> ${err}`);
		io.emit('chat history', ['Error retrieving chat history']);
		return;
	    }
	    if(msgs.length){
		io.emit('chat history', msgs.map( m => m.message));
	    }
	});
    
    socket.on('disconnect', function() {
	console.log('user disconnected');
    });
    
    socket.on('chat message', function(msg){
	io.emit('chat message', msg);

	// Save chat to the database
	connect.then(db => {
	    console.log('connected correctly to the server');
	    let chatMessage = new Chat({ message: msg, sender: 'Anonymous' });
	    
	    chatMessage.save();
	});
    });
});

http.listen(port, function(){
    console.log(`Listening on *:${port}`);
});
