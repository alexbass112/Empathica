/* Tabs
*******************************************************************************/
$("#tab-open")
    .click(function() {
        $("#closed").hide(); $("#open").show();
        $("#tabs .selected").removeClass("selected");
        $(this).addClass("selected");
    });
$("#tab-closed")
    .click(function() {
        $("#open").hide(); $("#closed").show();
        $("#tabs .selected").removeClass("selected");
        $(this).addClass("selected");
    });

/* Conflicts
*******************************************************************************/
$(".conflicts > li")
    .hover(function() {
        $(this).find(".btnX:first").show();
    }, function() {
        $(this).find(".btnX:first").hide();
    });
$(".btnClose")
    .click(function(e) {
        e.stopPropagation();
        var conflictItem = $(this).parent().parent();
        var id = conflictItem.attr("id");
        $.getJSON(
            "{{=URL('call/json/close_conflict')}}",
            {'id': id},
            function(data) {
                if (data.success) {
                    conflictItem.fadeOut(300, function() {
                        $(this).remove();
                        location.href = "{{=URL('manage')}}";
                    });
                } else { /* [TODO] */ }
                return false;
            }
        ).error(function(json) {});
        return false;
    });
$(".btnDelete")
    .click(function(e) {
        e.stopPropagation();
        var conflictItem = $(this).parent().parent();
        var id = conflictItem.attr("id");
        $.getJSON(
            "{{=URL('call/json/delete_conflict')}}",
            {'id': id},
            function(data) {
                if (data.success) {
                    conflictItem.fadeOut(300, function() {
                        $(this).remove();
                        location.href = "{{=URL('manage')}}";
                    });
                } else { /* [TODO] */ }
                return false;
            }
        ).error(function(json) {});
        return false;
    });