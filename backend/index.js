const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const amqp = require('amqplib/callback_api');

const port = process.env.PORT || '3000';
const amqpServer = process.env.AMQP_SERVER || 'localhost';
const amqpQueue = process.env.AMQP_QUEUE || 'finchat-task';

// Database connection
const Chat = require('./models/finchat');
const connect = require('./dbconn');

// RabbitMQ
function publishToQueue(msg, room){
    amqp.connect(`amqp://${amqpServer}`, function (err, conn) {
	conn.createChannel(function (err, channel) {
	    channel.assertQueue(amqpQueue, { durable: true });

	    const payload = JSON.stringify({
		msg: `${msg.toUpperCase()} quote is $93.42 per share`,
		room
	    });
	    channel.sendToQueue(amqpQueue, Buffer.from(payload));
	    console.log(` [x] Sent ${msg} on room ${room}`);
	});
    });
}

function startWorker(){
    amqp.connect(`amqp://${amqpServer}`, function (err, conn) {
	conn.createChannel(function (err, channel) {
	    channel.assertQueue(amqpQueue, { durable: true });
	    channel.prefetch(1);
    
	    console.log('Waiting tasks...');

	    channel.consume(amqpQueue, async (message) => {
		setTimeout(function(){
		    const content = message.content.toString();
		    const task = JSON.parse(content);
		    
		    io.sockets.in(task.room).emit('chat message', task.msg);
		    
		    channel.ack(message);
		    
		    console.log(` [x] Recieved ${task.msg} for room ${task.room}`);
		},4000);
	    });
	});
    });
}

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
	if(data.msg.startsWith('/stock=')){
	    const stock = data.msg.split('=')[1];
	    publishToQueue(stock, data.room);
	    return;
	}
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
    startWorker();
});

process.on('exit', (code) => {
    channel.close();
    connection.close();
    console.log(`Closing rabbitmq channel and connection`);
});
