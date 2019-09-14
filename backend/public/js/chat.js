$(function () {
    var socket = io('http://localhost:3000/');
    socket.emit('subscribe');

    $('form').submit(function(e){
	e.preventDefault(); // prevents page reloading
	var payload = {
	    'msg':  $('#m').val()
	};
	socket.emit('chat message', payload);
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

    socket.on('disconnect', function() {
	socket.emit('unsubscribe');
    });
});
