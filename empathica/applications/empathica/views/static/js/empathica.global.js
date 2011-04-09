/* Header
*******************************************************************************/
$.fn.toolbarButton.defaults.iconSrc = "{{=URL('static','images/icons/nav.png')}}";
{{ if USER : }}
    $("#btnBack")
        .toolbarButton({
            icon: 0, label: "Manage Conflicts", href: "{{=URL('conflict','manage')}}",
        });
     $("#btnUserMenu")
        .toolbarButton({
            icon: 3, label: "{{=USER}}", labelRight: true,
        })
        .hover(function() {
            $("#user-menu").stop(true,true).slideDown(300);
        },function() {
            $("#user-menu").stop(true,true).slideUp(300);
        });
{{ else: }}
    $("#btnBack")
    .toolbarButton({
        icon: 0, label: "Home", href: "{{=URL('default','index')}}",
    });
     $("#btnUserMenu")
        .toolbarButton({
            icon: 2, label: "Sign in", labelRight: true,
            href: "{{=URL('default','user',args=['login'])}}",
        }).addClass("tooltip").attr('title',"With your Google Account");
{{ pass }}

/* Footer
*******************************************************************************/
$("#footer-top")
    .click(function() {
         $("html, body").animate({scrollTop: 0}, 300);
        return false;
    });

/* Controls
*******************************************************************************/
// Tooltips
$(".tooltip")
    .tipTip({
        edgeOffset: 5,
        delay: 200
    });
// Relative timestamps
$(".timestamp")
    .each(function() {
        $(this)
            .append(jQuery.timeago($(this).attr('title')))
            .addClass("tooltip"); // tooltip shows absolute timestamp
    });
// Radio buttons
  $(".cb-enable").click(function(){
        var parent = $(this).parents('.switch');
        $('.cb-disable',parent).removeClass('selected');
        $(this).addClass('selected');
        $('.checkbox',parent).attr('checked', true);
    });
    $(".cb-disable").click(function(){
        var parent = $(this).parents('.switch');
        $('.cb-enable',parent).removeClass('selected');
        $(this).addClass('selected');
        $('.checkbox',parent).attr('checked', false);
    });

/* Notifications
*******************************************************************************/
$(".flash").hide();
{{ if response.flash: }}
    $(".flash-x").click(function() {
        $(".flash").hide();
    });
    $(".flash")
        .width($(".flash").width())
        .css({
            'border-radius': '10px',
            'margin': '0 auto',
            'left': 0, 'right': 0,
            'opacity': '0.60',
        })
        .delay(500)
        .fadeIn(1000)
        .hover(function() {
            clearTimeout(killFlash);
            $(this).stop().animate({'opacity': '0.85'}, 300);
            $(".flash-x").stop(true,true).fadeIn(300);
            return false;
        }, function() {
            $(this).stop().animate({'opacity': '0.60'}, 300);
            $(".flash-x").stop(true,true).fadeOut(300);
            killFlash = setTimeout(function() { $(".flash").fadeOut(1000); }, 3000);
            return false;
        })
        var killFlash = setTimeout(function() { $(".flash").fadeOut(1000); }, 5000);
{{ pass }}

/* BlockUI
*******************************************************************************/
$.blockUI.defaults.css = {
    padding:        0, 
    margin:         0, 
    width:          '30%', 
    top:            '40%', 
    left:           '35%', 
    textAlign:      'center', 
    fontSize:       '20px',
    color:          '#fff', 
    cursor:         'wait' 
};