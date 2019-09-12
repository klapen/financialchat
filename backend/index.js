const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const port = process.env.PORT || '3000';

// Database connection
const Chat = require('./models/finchat');
const connect = require('./dbconn');

// Set the express.static middleware
app.use(express.static(__dirname + "/public"));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/chat.html');
});

io.on('connection', function(socket){
    console.log('user connected');

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
			    msgs.reverse().map( m => m.message)
			);
		}
	    });
    });

    socket.on('unsubscribe', function(room) {
        console.log('leaving room', room);
        socket.leave(room);
    });

    socket.on('chat message', function(data){
	io.sockets.in(data.room).emit('chat message', data.msg);

	// Save chat to the database
	connect.then(db => {
	    let chatMessage = new Chat({ message: data.msg, sender: 'Anonymous', room: data.room });
	    
	    chatMessage.save();
	}).catch(err => {
	    console.log(`Error - DB connection: ${err}`)
	});
    });
});

http.listen(port, function(){
    console.log(`Listening on *:${port}`);
});
