const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const port = process.env.PORT || '3000';

app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/chat.html');
});

io.on('connection', function(socket){
    socket.on('chat message', function(msg){
	io.emit('chat message', msg);
    });
});

http.listen(port, function(){
    console.log(`Listening on *:${port}`);
});
