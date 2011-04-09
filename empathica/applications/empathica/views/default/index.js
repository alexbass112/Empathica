/* Slider
*******************************************************************************/
$("#info #description").animate({ opacity: 0.85 }, 1 );
$("#options li").not("#more")
    .click(function() {
        var img = $(this).find('a').attr("href");
        var desc = $(this).find('p').html();
        if ($(this).is(".active")) {
            return false;
        } else {
            $("#info img").stop(true,true).fadeOut(250, function() {
                $(this).attr({ src: img });
                $(this).fadeIn(250);
            });
            $("#info #description p").stop(true,true).fadeOut(250, function() {
                $(this).html(desc);
                $(this).fadeIn(250);
            });
        }
        $("#options li").removeClass('active');
        $(this).addClass('active');
        return false;
    });
$("#options #more")
    .click(function() {
        location.href="{{=URL('about')}}";
        return false;
    });