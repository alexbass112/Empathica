/* Header
*******************************************************************************/
$("#btnDone")
    .toolbarButton({
        icon: 6, iconSrc: "{{=URL('static','images/icons/nav.png')}}",
        label: "Done",
        href: "{{=URL('cam','edit',args=[cam.id])}}",
    })
    .click(function() {
        location.href = "{{=URL('conflict','overview', args=[conflict.id])}}";
    });
$("#btnEditor")
    .toolbarButton({
        icon: 4, iconSrc: "{{=URL('static','images/icons/nav.png')}}",
        label: "Editor", labelRight: true,
        href: "{{=URL('cam','edit',args=[cam.id])}}",
    });

/* DOM Creation
*******************************************************************************/
var msgCounsellor = function(msg) {
    $("#conversation")
        .append('<div class="counsellor message wordwrap"><div class="icon"></div>'+msg+'</div>');

}
var msgUser = function(msg) {
    $("#conversation")
        .append('<div class="user message wordwrap"><div class="icon"></div>'+msg+'</div>');
}
var showInput = function() {
    $("#input").show();
    $("#send").focus();
}
var hideInput = function() {
    $("#input").hide();
}

/* User Input
*******************************************************************************/
$("#send")
    .autoResize()
    .keyup(function(e) {
        var msg = $(this).val();
        if ( msg.trim() == "") {
            $("#i-PressEnter").fadeOut(300);
        } else if (e.keyCode == 13) {
            send();
        } else {
            $("#i-PressEnter").fadeIn(300);
        }
        return false;
    });

$(document.documentElement)
    .keyup(function(e) {
        if ($("#send").val().trim() != "" && e.keyCode == 13) {
            send();
        }
        return false;
    });

$("#keyboard-icon")
    .click(function() {
        send();
    });
    
/* Send Message
*******************************************************************************/
var send = function() {
    hideInput();
    msg = $("#send").val();
    $("#i-PressEnter").hide();
    if (msg != "") { msgUser(msg); }
    $.post(
        "{{=URL(r=request,f='talk', args=[request.args(0)])}}", 
        {message: msg},
        function(data) {
            setTimeout(function() {
                msgCounsellor(data);
                $("html body").animate({ scrollTop: $("#instructions").offset().top-600}, 500);
                showInput();
                $("#i-Waiting").hide();
                $("#send").css('height', "28px");
            }), 3000; 
        },
        "html");
    $('#send').val("").blur();
    $("#i-Waiting").show();
    return false;
}

/* Init
*******************************************************************************/
send();