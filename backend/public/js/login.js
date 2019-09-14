$(document).ready(function(){
    var email, pass;
    $("#submit").click(function(){
        email=$("#email").val();
        pass=$("#password").val();
        /*
         * ToDo: change to token
         */
        $.post("/",{ email:email, pass:pass },function(data){
	    console.log(data);
	    if(data.token) {
                window.location.href="/chat";
	    }
        });
    });
});
