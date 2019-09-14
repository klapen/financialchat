$(document).ready(function(){
    var email, pass, room;
    $("#submit").click(function(){
        email = $("#email").val();
        pass = $("#password").val();
	room = $("#room").val();
        $.post("/",{ email: email, pass: pass, room: room },function(data){
	    if(data.error){
		$("#error-msg").text(data.error);
		$("#password").val('');
	    }
	    if(data.token) {
                window.location.href="/chat";
	    }
        });
    });
});
