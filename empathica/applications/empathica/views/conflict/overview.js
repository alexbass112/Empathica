
$(".cam .thumbnail").hover(function() {
    $(this).children(".overlay").stop(true,true).fadeIn(500);
    $(this).children("h6").css('color','#fff');
}, function() {
    $(this).children(".overlay").stop(true,true).fadeOut(500);
    $(this).children("h6").css('color','#aaa');
});
