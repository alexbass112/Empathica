/* Toolbar
*******************************************************************************/
/*
$("#header,#suggestions").delay(3000).animate({'opacity': '0.8'}, 3000);
$("#header,#suggestions").hover(function() {
    $("#header,#suggestions").stop().animate({'opacity': '1.0'}, 300);
}, function() {
    $("#header,#suggestions").stop().animate({'opacity': '0.8'}, 3000);
});
*/

$.fn.toolbarButton.defaults.iconSrc = "{{=URL('static','images/icons/edit.png')}}";
$("#btnSelect").toolbarButton({ icon: 0, group: "inputMode" });
$("#btnAddConcepts").toolbarButton({ icon: 1, group: "inputMode" });
$("#btnAddConnections").toolbarButton({ icon: 2, group: "inputMode" });
$("#btnAddComments").toolbarButton({ icon: 3, group: "inputMode" });
$("#btnZoomFit").toolbarButton({ icon: 4 });
$("#btnSettings").toolbarButton({ icon: 5 });
$.fn.toolbarButton.defaults.iconSrc = "{{=URL('static','images/icons/nav.png')}}";
$("#btnCounsellor").toolbarButton({ icon: 5, label: "Counsellor", labelRight: true });
$("#btnDone").toolbarButton({ icon: 6, label: "Done" });

/* Suggestions
*******************************************************************************/
var suggestions = {};
var addSuggestion = function(id, name) {
    if (id in suggestions) { return false; }
    $("#suggestions ul").append(
        "<li id='suggestion-"+id+"' class='concept'>"+name+"<div id='ignore-"+id+"' class='concept-x tooltip' title='Ignore'><div class='concept-x-icon'></div></div></li>"
    );
    $("#suggestion-"+id).draggable({
        opacity: 0.7,
        helper: "clone",
        revert: "valid",
        scroll: false,
    }).each(function() {
        this.onselectstart = function() { return false; };
    }).children(":first").click(function() {
        // ignore-x
        var id = $(this).attr('id').split('-').pop();
        ignoreSuggestion(id);
    });;
    suggestions[id] = name;
}

var getSuggestions = function() {
    $.getJSON(
        "{{=URL('call/json/get_suggestions')}}",
        {'map_id': {{=cam.id}}},
        function(data) {
            if (!data.success) { return false; }
            debugOut('getSuggestions');
            $.each(data.suggestions, function(i,suggestion) {
                addSuggestion(suggestion[0], suggestion[1]);
            });
            $("#suggestions > ul").center();
        }
    );
}

var ignoreSuggestion = function(id) {
    $.getJSON(
        "{{=URL('call/json/ignore_suggestion')}}",
        {'map_id': {{=cam.id}}, 'id': id},
        function(data) {
            if (!data.success) { return false; }
            $("#suggestion-"+id).fadeOut(300, function() {
                $(this).remove();
                if (getSuggestionCount() == 0) {
                    $("#suggestions").stop(true,true).slideUp(300);
                }
            });
        }
    );
}

jQuery.fn.center = function () {
    this.css("position","absolute");
    //this.css("top", ( $(window).height() - this.height() ) / 2+$(window).scrollTop() + "px");
    this.css("left", ( $(window).width() - this.width() ) / 2+$(window).scrollLeft() + "px");
    return this;
}


$("#suggestions .concept").draggable({
    opacity: 0.7,
    helper: "clone",
    revert: "valid",
});

$("#canvasDiv").droppable({
    drop: function(e,ui) {
        // check if in bounds
        if (e.pageY < 84) { return false; }
        
        var id = -1;
        for (var s in suggestions) {
            if (suggestions[s] == ui.draggable.text()) {
                id = s;
                debugOut('Adding: ' + id);
                break;
            }
        }
        
        if (id == -1) {
            debugOut('Could not find ID of suggested node');
            return;
        }
        
        var coords = g.getCursorPosition(e);
        var mx = coords[0];
        var my = coords[1];
        g.addSuggestedNode(id, ui.draggable.text(), mx, my);
        
        // Remove from list
        ui.draggable.remove();
        $("#btnSelect").toolbarButton('toggle'); // [TODO] ALEX MOVE THIS
        
        // delete suggestions[ui.draggable.attr('id').split('-').pop()];
    }
});

// Dragging fix
$("#canvasDiv,.unselectable").each(function() {
    this.onselectstart = function() { return false; };
});

var getSuggestionCount = function() {
    return $("#suggestions").children().children().length-1; // -1 for label node
}


/* Buttons
*******************************************************************************/
$("#btnSelect").click(function() {
    $("#canvasDiv")
        .css('cursor', 'default');
    $("#suggestions")
        .stop(true,true).slideUp(300);
    g.setState(g.stateDefault);
});
$("#btnAddConcepts").click(function() {
    $("#canvasDiv")
        .css('cursor', 'crosshair');
    getSuggestions();
    if (getSuggestionCount() > 0) {
        $("#suggestions").stop(true,true).slideDown(300);
    }
    g.setState(g.stateAddingNodes);
});
$("#btnAddConnections").click(function() {
    $("#canvasDiv")
        .css('cursor', 'crosshair');
    $("#suggestions")
        .stop(true,true).slideUp(300);
    g.setState(g.stateAddingEdges);
});
$("#btnAddComments").click(function() {
    $("#canvasDiv")
        .css('cursor', 'crosshair');
    $("#suggestions")
        .stop(true,true).slideUp(300);
    g.setState(g.stateAddingComments);
});
$("#btnZoomFit").click(function() {
    g.centreGraph();
});

$("#btnSettings").click(function() {
    $("#winSettings").modal();
});
$("#btnCounsellor").click(function() {
    g.saveGraph("{{=URL('cam','counsellor',args=[cam.id])}}");
    //location.href = "{{=URL('cam','counsellor',args=[cam.id])}}";
});
$("#btnDone").click(function() {
    $('#btnSelect').toolbarButton('toggle');
    g.saveGraph("{{=URL('conflict','overview', args=[conflictid])}}");
    $.blockUI({
        message: "Saving. Just a moment... ",
    });
    //setTimeout(function() {location.href = "{{=URL('conflict','overview', args=[conflictid])}}" }, 2000);
    // TODO: set timeout if ajax calls never return? 
});

/* Properties Modal
*******************************************************************************/

var showTitle = {{=cam.show_title or 'true'}};

if (showTitle) {
    $("#conflict-title,#cam-title").show();
    $("#showTitle").attr('checked',true);
    $("#showTitle").siblings(".cb-enable").addClass('selected');
} else {
    $("#conflict-title,#cam-title").hide();
    $("#showTitle").removeAttr('checked');
    $("#showTitle").siblings(".cb-disable").addClass('selected');
}
var theme = '{{=cam.theme}}';

$.extend($.modal.defaults, {
    containerId: 'modal-container',
    dataId: 'modal-data',
    overlayId: 'modal-overlay',
    persist: true,
    close: true,
    overlayClose: true,
    onOpen: function(dialog) {
        dialog.container.show();
        dialog.data.show();
        dialog.overlay.fadeIn(300);
    },
    onClose: function(dialog) {
        dialog.container.fadeOut(300);
        dialog.overlay.fadeOut(300, function() {
            $.modal.close();
        });
    },
});

$("#btnApply")
    .click(function() {
        var showTitle = $("#showTitle").is(":checked");
        if (showTitle) {
            $("#conflict-title,#cam-title").show();
        } else {
            $("#conflict-title,#cam-title").hide();
        }
        var theme = $("#theme").val();
        g.setTheme(THEMES[theme]);
        $.modal.close();
    });

$("#btnRecover")
    .click(function() {
        $.modal.close();
        window.setTimeout(function() { $("#restoreGraph").modal(); }, 500);
        return false;
    });
    
$("#btnRestore") 
    .click(function() {
        var saveText = $("#restore-text").text();
        if (saveText != "") {
            g.generateGraphFromString(saveText);
        }
        $.modal.close();
        g.repaint();
    });
    
/* Initialization
*******************************************************************************/

testIt();
g.initGraphFromDB();
$("#btnSelect").toolbarButton('toggle');
//$("#btnAddConcepts").toolbarButton('toggle');
getSuggestions();