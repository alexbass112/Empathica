/* Header
*******************************************************************************/
$("#btnOverview")
    .toolbarButton({
        icon: 0, iconSrc: "{{=URL('static','images/icons/nav.png')}}",
        label: "Overview",
        href: "{{=URL('overview',args=[conflict.id])}}",
    }); // TODO: warning message
$("#btnDone")
    .toolbarButton({
        icon: 6, iconSrc: "{{=URL('static','images/icons/nav.png')}}",
        label: "Done", labelRight: true,
    }).click(function() {
        submit();
    });

var add = function(map, id, name, toLeft) {
    if (toLeft) {
        var concept = $("#left .concepts").append('<li id="'+map+"-"+id+'" class="concept wordwrap draggable">'+name+'</li>').children(":last");
        concept.droppable({
            accept: "#right .concept",
            activeClass: "concept-active",
            hoverClass: "concept-hover",
            drop: drop,
        });
    } else {
        var concept = $("#right .concepts").append('<li id="'+map+"-"+id+'" class="concept wordwrap draggable">'+name+'</li>').children(":last");
        concept.droppable({
            accept: "#left .concept",
            activeClass: "concept-active",
            hoverClass: "concept-hover",
            drop: drop,
        });
    }
    //equalHeight($('.column'));
    concept.draggable({
        opacity: 0.7,
        helper: "original",
        revert: "invalid",
        stack: ".concept",
        scroll: true,
    });
}

    
function equalHeight(group) {
   tallest = 0;
   group.each(function() {
      thisHeight = $(this).height();
      if(thisHeight > tallest) {
         tallest = thisHeight;
      }
   });
   group.height(tallest);
}    
    
var correlate = function(map1, id1, name1, map2, id2, name2, same) {
    if (same) {
        $("#pairs")
            .append(
                '<li id="'+map1+"-"+id1+'-'+map2+"-"+id2+'" class="pair">' +
                '<div class="close tooltip" title="Undo"></div>' +
                '<div class="label">'+name1+' &#61; '+name2+'</div>' +
                '<div class="opposite tooltip" title="Mark as Opposite"></div>' +
                '</li>'
            )
            .children("#"+map1+"-"+id1+"-"+map2+"-"+id2)
            .hover(pairHover[0],pairHover[1])
            .children(".opposite").click(oppositeClick)
            .siblings(".close").click(undoClick);
    } else {
        $("#pairs")
            .append(
                '<li id="'+map1+"-"+id1+'-'+map2+"-"+id2+'" class="pair">' +
                '<div class="close tooltip" title="Undo"></div>' +
                '<div class="label">'+name1+' &#61; '+name2+'</div>' +
                '<div class="similiar tooltip" title="Mark as Similiar"></div>' +
                '</li>'
            )
            .children("#"+map1+"-"+id1+"-"+map2+"-"+id2)
            .hover(pairHover[0],pairHover[1])
            .children(".similiar").click(similiarClick)
            .siblings(".close").click(undoClick);
    }
    // fix height
    var x = $("#pairs").children("#"+map1+"-"+id1+"-"+map2+"-"+id2);
    var height = x.children(".label").height();
    x.height(height);
};

var undoClick = function() {
    var isDiff = $(this).parent().hasClass('diff');
    var IDs = $(this).parent().attr('id').split('-');
    if (isDiff) {
        var names = $(this).siblings('.label').text().split('\u2260');
    } else {
        var names = $(this).siblings('.label').text().split('\u003d');
    }
    add(IDs[0], IDs[1], names[0], true);
    add(IDs[2], IDs[3], names[1], false);
    $(this).parent().fadeOut(300,function(){
        $(this).remove();
    });
}
var oppositeClick = function() {
    $(this)
        .removeClass('opposite')
        .addClass('similiar')
        .click(similiarClick)
        .attr('title', "Mark as Similiar");
    var label = $(this).siblings(".label");
    label
        .addClass('diff')
        .html(label.html().replace('\u003d','\u2260'))
        .parent()
            .addClass('diff');
}
var similiarClick = function() {
    $(this)
        .removeClass('similiar')
        .addClass('opposite')
        .click(oppositeClick)
        .attr('title', "Mark as Opposite");
    var label = $(this).siblings(".label");
    label
        .removeClass('diff')
        .html(label.html().replace('\u2260','\u003d'))
        .parent()
            .removeClass('diff');
}
// unblock when ajax activity stops 
$(document).ajaxStop($.unblockUI); 

var submit = function() {
    var pairs = [];
    $.each($("#pairs").children(), function(index) {
        var isDiff = $(this).hasClass('diff');
        var id = $(this).attr('id').split('-');
        if (isDiff) {
            var name = $(this).children('.label').text().split('\u2260');
        } else {
            var name = $(this).children('.label').text().split('\u003d');
        }
        var pair = [id[0],id[1],id[2],id[3],!isDiff];
        pairs.push(pair);
    });
    
    $.post(
        "{{=URL('call/json/correlate_nodes',args=[request.args[0],request.args[1]])}}",
        JSON.stringify(pairs),
        function(data) {
            if (data.success) {
                location.href = "{{=URL('overview',args=[conflict.id])}}";
                return true;
            } else {
                return false;
            }
        }
    );
    $.blockUI({message: "Saving. Just a moment... "});
}

$(".draggable").draggable({
    opacity: 0.7,
    helper: "original",
    revert: "invalid",
    stack: ".concept",
});

var drop = function(e, ui) {
    if (ui.draggable.parent().parent().attr('id') == "left") {
        var src = ui.draggable;
        var dst = $(this);
    } else {
        var src =$(this);
        var dst = ui.draggable;
    }
    var id1 = src.attr('id').split('-');
    var id2 = dst.attr('id').split('-');
    
    correlate(
        id1[0],id1[1],
        src.text(),
        id2[0],id2[1],
        dst.text(),
        true
    );
    
    src.fadeOut(300, function() { $(this).remove(); });
    dst.fadeOut(300, function() { $(this).remove(); });
}

$("#right .concept").droppable({
    accept: "#left .concept",
    activeClass: "concept-active",
    hoverClass: "concept-hover",
    drop: drop,
});
$("#left .concept").droppable({
    accept: "#right .concept",
    activeClass: "concept-active",
    hoverClass: "concept-hover",
    drop: drop,
});

var pairHover = [function() {
    $(this).children(".close,.opposite,.similiar").stop(true,true).fadeIn(300);
}, function() {
    $(this).children(".close,.opposite,.similiar").stop(true,true).fadeOut(300);
}];

$(".pair").hover(pairHover[0],pairHover[1]);
$(".pair .opposite").click(oppositeClick);
$(".pair .close").click(undoClick);

// init
{{ for node in a_nodes: }}
    add({{=node.id_map}}, {{=node.id}}, "{{=node.name}}", true);
{{ pass }}
{{ for node in b_nodes: }}
    add({{=node.id_map}}, {{=node.id}}, "{{=node.name}}", false);
{{ pass }}
{{ for pair in related_nodes: }}
    correlate({{=pair[0]}}, {{=pair[1]}}, "{{=pair[2]}}", {{=pair[3]}}, {{=pair[4]}}, "{{=pair[5]}}", {{=str(pair[6]).lower()}});
{{ pass }}

//equalHeight($('.column')); 
//$("#center").height($("#center").height()-22);