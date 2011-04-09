 /*
 * toolbarButton
 * Copyright 2011 Rob Disano
 *
 * Version 2.1
 */
 
(function($) {

    /* Helpers */
    var activate = function(e) { e.children('.toolbarButton-active').stop(true,true).fadeIn(300); }
    var deactivate = function(e) { e.children('.toolbarButton-active').stop(true,true).fadeOut(300); }

    /* Init */
    var init = function(options) {
        var opts = $.extend({}, $.fn.toolbarButton.defaults, options);        
        var sharedCSS = {
            'cursor': 'pointer',
            'float': (opts.labelRight) ? 'right' : 'left',
        }        
        var iconCSS = {
            'background-repeat': 'no-repeat',
            'background-image': 'url('+opts.iconSrc+')',
            'width': opts.width,
            'height': opts.height,
        }
        var iconActive = $(document.createElement('div'))
            .css(sharedCSS).css(iconCSS)
            .css('background-position', '-'+(opts.icon*opts.width)+'px -'+opts.height+'px');
        var iconInactive = $(document.createElement('div'))
            .css(sharedCSS).css(iconCSS)
            .css('background-position', '-'+(opts.icon*opts.width)+'px 0px');            
        var labelCSS = {
            'line-height': opts.height+'px',
        }
        var label = $(document.createElement('div'))
            .css(sharedCSS).css(labelCSS)
            .append(opts.label);
        var inactiveDiv = $(document.createElement('div'))
            .append(iconInactive)
            .css('position','relative')
            .addClass('toolbarButton-inactive');
        var activeDiv = $(document.createElement('div'))
            .append(iconActive)
            .css('position','absolute')
            .addClass('toolbarButton-active')        
        activeDiv.hide(); // activate on hover        
        /* Label (optional) */
        if (opts.label) {
            var padding = (opts.labelRight) ? {'padding-left': '10px'} : {'padding-right': '10px'};
            label.css(padding);
            inactiveDiv.append(label.clone());
            activeDiv.append(label.clone());
        }
        return this.each(function() {
            var obj = $(this);
            /* Construct DOM tre */
            obj.append(inactiveDiv, activeDiv);
            /* Grouping */
            var groupName = "toolbarButton-group-"+opts.group
            if (opts.toggled) {
                obj.addClass(groupName);
                activeDiv.show();
            }
            /* Hover effect */
            obj.hover(function() {
                var e = $(this);
                if (!e.hasClass(groupName)) { activate(e); }
            }, function() {
                var e = $(this);
                if (!e.hasClass(groupName)) { deactivate(e); }
            });            
            /* Toggle group on click */
            if (opts.group) {
                obj.click(function() {
                    var e = $(this);
                    if (!e.hasClass(groupName)) {
                        // deactivate other
                        var x = $('.'+groupName).removeClass(groupName);
                        deactivate(x);
                        // activate this
                        e.addClass(groupName);
                        activate(e);
                    }
                   // opts.onclick();
                });
            } else {
                //obj.click(opts.onclick);
            }            
            /* Click shortcut */
            if (opts.href) {
                obj.click(function() {
                    location.href = opts.href;
                });
            }
        }); // this.each()
    };
    
    var toggle = function() {
        return this.each(function() {
            var obj = $(this);
            $(this).click();
        }); // this.each()
    };
    
    var methods = {
        init: init,
        toggle: toggle,
    };

    $.fn.toolbarButton = function(method) {
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
        }   
    };
        
    $.fn.toolbarButton.defaults = {
        icon: 0, // icon index
        iconSrc: "",
        group: "",
        toggled: false,
        label: "",
        labelRight: false,
        href: "",
        width: 44,
        height: 44,
        fadeTime: 300,
        onclick: function() {},
    }

})(jQuery); 