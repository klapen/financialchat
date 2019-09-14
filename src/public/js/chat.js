$(() => {
  const socket = io('http://localhost:3000/');
  socket.emit('subscribe');

  $('form').submit((e) => {
    e.preventDefault(); // prevents page reloading
    const payload = {
	    msg: $('#m').val(),
    };
    socket.emit('chat message', payload);
    $('#m').val('');
    return false;
  });

  socket.on('chat message', (msg) => {
    $('#messages').append($('<li>').text(msg));
  });

  socket.on('chat error', (msg) => {
    $('#messages').append($('<li>').text(msg));
  });

  socket.on('chat history', (msgs) => {
    msgs.forEach((m) => {
	    $('#messages').append($('<li>').text(m));
    });
  });

  socket.on('disconnect', () => {
    socket.emit('unsubscribe');
  });
});
