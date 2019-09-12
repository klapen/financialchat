$(function () {
    var socket = io('http://localhost:3000/');
    $('form').submit(function(e){
	e.preventDefault(); // prevents page reloading
	socket.emit('chat message', $('#m').val());
	$('#m').val('');
	return false;
    });
    socket.on('chat message', function(msg){
	$('#messages').append($('<li>').text(msg));
    });
    socket.on('chat history', function(msgs){
	msgs.forEach( function(m){
	    $('#messages').append($('<li>').text(m))
	});;
    });
});
