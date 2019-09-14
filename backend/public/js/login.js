$(document).ready(function(){
    var email, pass;
    $("#submit").click(function(){
        email=$("#email").val();
        pass=$("#password").val();
        $.post("/",{ email:email, pass:pass },function(data){
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
