/* Header
*******************************************************************************/
$("#btnOverview")
    .toolbarButton({
        icon: 0, iconSrc: "{{=URL('static','images/icons/nav.png')}}",
        label: "Overview",
        href: "{{=URL('overview',args=[conflict.id])}}",
    }); // TODO: warning message

$("#btnMore")
    .click(function() {
        $(".column").not("#center").css("height", "auto");
        $(this).fadeOut(300);
        $(".column .hidden").fadeIn(300);
        $("#center").fadeIn(300);
        $(".column").not("#center").equalHeights(true);
    });
$('.column ul li').hyphenate(); 
$(".column").not("#center").equalHeights(true);
