/* Header
*******************************************************************************/
$("#btnOverview")
    .toolbarButton({
        icon: 0, iconSrc: "{{=URL('static','images/icons/nav.png')}}",
        label: "Overview",
        href: "{{=URL('overview',args=[conflict.id])}}",
    }); // TODO: warning message
    
jQuery.fn.center = function () {
    this.css("position","absolute");
    //this.css("top", ( $(window).height() - this.height() ) / 2+$(window).scrollTop() + "px");
    this.css("left", ( $(window).width() - this.width() ) / 2+$(window).scrollLeft() + "px");
    return this;
}

var current_id = {{=best_sol}}
var prevClick = function() {
    $("#suggestions-"+current_id+",#groups-"+current_id).removeClass('selected').hide();
    current_id -= 1;
    $("#suggestions-"+current_id+",#groups-"+current_id).addClass('selected').show();
    if ($("#next").hasClass('disabled')) {
        $("#next").removeClass('disabled').click(nextClick);
    }
    if (current_id == 0) {
        $("#prev").unbind('click').addClass('disabled');
    }
};
var nextClick = function() {
    $("#suggestions-"+current_id+",#groups-"+current_id).removeClass('selected').hide();
    current_id += 1;
    $("#suggestions-"+current_id+",#groups-"+current_id).addClass('selected').show();
    if ($("#prev").hasClass('disabled')) {
        $("#prev").removeClass('disabled').click(prevClick);
    }
    if (current_id >= {{=len(ret_list)}}-1) {
        $("#next").unbind('click').addClass('disabled');
    }
};  

$('#suggestions li').hyphenate(); 
{{ if best_sol != 0: }}
    $("#prev").click(prevClick);
{{ pass }}
{{ if best_sol != len(ret_list): }}
    $("#next").click(nextClick);
{{ pass }}


$("#optimal").click(function() {
    $("#suggestions-"+current_id+",#groups-"+current_id).removeClass('selected').hide();
    current_id = {{=best_sol}};
    $("#suggestions-"+current_id+",#groups-"+current_id).addClass('selected').show();
    if (current_id == 0) {
        $("#prev").unbind('click').addClass('disabled');
    } else {
        $("#prev").removeClass('disabled').click(prevClick);
    }
    if (current_id >= {{=len(ret_list)}}-1) {
        $("#next").unbind('click').addClass('disabled');
    } else {
        $("#next").removeClass('disabled').click(nextClick);
    }
});