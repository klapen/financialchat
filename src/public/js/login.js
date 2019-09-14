$(document).ready(() => {
  let email; let pass; let
    room;
  $('#submit').click(() => {
    email = $('#email').val();
    pass = $('#password').val();
    room = $('#room').val();
    $.post('/', { email, pass, room }, (data) => {
	    if (data.error) {
        $('#error-msg').text(data.error);
        $('#password').val('');
	    }
	    if (data.token) {
        window.location.href = '/chat';
	    }
    });
  });
});
