var textboxlistConfig = {
    max: 10,
    unique: true,
    bitsOptions:{
        editable:{
            addKeys: [13, 32, 188], // Keys: enter, space, comma
            addOnBlur: true,
        }
    },
    check: function(s) { 
        var email = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
        return email.test(s);
    }
};

var users1 = new $.TextboxList('#NewConflict_users1', textboxlistConfig);
var users2 = new $.TextboxList('#NewConflict_users2', textboxlistConfig);
$(".textboxlist-bit-editable-input")
    .focus(function() { 
        $(this).parent().parent().css({
            'outline': "3px solid #aaa !important"
        });
    })
    .focusout(function() {
        $(this).parent().parent().css({
            'outline': "1px solid #e1e1e1 !important"
        });
    })
    .attr('tabindex', 8);
    
$("#btnAddPeople")
    .click(function() {
        users1.add("{{=auth.user.email}}");
        $("html, body").animate({scrollTop: $(document).height()}, 300);
        $("#invite").fadeIn(300, function() {
            $("#NewConflict_users1").parent().find(".textboxlist-bit-editable-input").focus();
        });
        $(this).hide();
    });
    
$("#NewConflict")
    .validationEngine({
        promptPosition: "topLeft", 
    });

{{ if form.errors: }}
    {{ for error in form.errors: }}
        $("#NewConflict_{{=error}}").validationEngine('showPrompt', '{{=form.errors[error]}}', 'error', 'topLeft', true);
    {{ pass }}
{{ pass }}

$("#NewConflict_title").focus();