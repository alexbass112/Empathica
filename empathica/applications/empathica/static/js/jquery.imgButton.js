 /*
 * imgButton
 * Copyright 2011 Rob Disano
 *
 * Version 1.0
 */
 
(function($) {

    $.fn.imgButton = function(options) {
        var opts = $.extend({}, $.fn.imgButton.defaults, options);
        
        // labelRight
        var align = (opts.labelRight) ? 'right' : 'left';
        // group
        if (opts.group) { this.addClass("imgButton-group-"+opts.group) }
        
        /* CSS */
        
        this.css({
            'cursor': 'pointer',
            'height': opts.height,
        });
        var sharedCSS = {
            'background-repeat': 'no-repeat',
            'background-image': 'url('+opts.src+')',
            'width': 'inherit',
            'height': 'inherit',
            'line-height': opts.height,
            'text-align': align,
        };
        var activeCSS = {
            'z-index': 1,
            'background-position': align+' -'+opts.height,
            'position': 'absolute',
        };
        var inactiveCSS = {
            'z-index': 2,
            'background-position': align+' top',
            'position': 'relative',
        };
        
        /* DOM */
        
        var label = $(document.createElement('span'))
            .addClass("imgButton-label")
            .css('margin-'+align, opts.width);
        var active = $(document.createElement('div')) 
            .addClass("imgButton-active")
            .css(sharedCSS)
            .css(activeCSS);
        var inactive = $(document.createElement('div'))
            .addClass("imgButton-inactive")
            .css(sharedCSS)
            .css(inactiveCSS);
        
        return this.each(function() {
            var obj = $(this);
            
            /* Construct DOM tree */
            obj.append(active, inactive);
            if (opts.label) {
                label.append(opts.label);
                active.append(label);
                inactive.append(label.clone());
                var width = label.outerWidth()+parseInt(opts.width.slice(0,-2));
                obj.css('width', width); // adapt to label length
            } else {
                obj.css('width', opts.width); // fixed size (icon only)
            }
            
            /* Hover */
            obj.hover(function() {
                inactive.stop().animate({'opacity': '0'}, opts.fadeTime); // reveal active
            }, function() {
                inactive.stop().animate({'opacity': '1'}, opts.fadeTime); // hide active
            });
            
            /* Click */
            if (opts.href) {
                obj.click(function() {
                    location.href = opts.href;
                });
            }
            
        });
    /*
    // construct nested divs
    var sharedCSS = {
      'background-image': 'url('+opts.src+')',
      'width': opts.width,
      'height': opts.height,
    }
    var divContainer = $(document.createElement('div'));
    if (opts.group) {
      divContainer.addClass('imgButton-group-'+opts.group);
    }
    var divInactive = $(document.createElement('div'))
      .css('background-position', '0px 0px')
      .css(sharedCSS)
      .addClass('imgButton-inactive');
    var divActive = $(document.createElement('div'))
      .css('background-position', '0px -'+opts.height)
      .css(sharedCSS)
      .addClass('imgButton-active');
    
    return this.each(function() {
      var obj = $(this);
      
      // toggled
      if (opts.toggled) {
        obj.data('active', true);
        divInactive.css('opacity', '0'); // paint
      }
    
      // add to DOM
      divContainer.append(divActive.append(divInactive))
      obj.append(divContainer);
      
      // add hover functionality to divContainer
      divContainer.hover(function() {
        var divInactive = $(this).find('.imgButton-inactive');
        if (obj.data('active')) {
          // do nothing
        } else {
          divInactive.stop().animate({'opacity': '0'}, 300); // reveal active
        }
        $(this).css('cursor', 'pointer'); // change cursor
      }, function() {
        var divInactive = $(this).find('.imgButton-inactive');
        if (obj.data('active')) {
          divInactive.stop().animate({'opacity' : '0'}, 300); // reveal active
        } else {
          divInactive.stop().animate({'opacity': '1'}, 300); // hide active
        }
      });
      
      // add toggle functionality to divContainer
      if (opts.group) {
        divContainer.click(function() {
          obj = $(this).parent();
          if (obj.data('active')) {
            obj.data('active', false);
            $(this).find('.imgButton-inactive').stop().animate({'opacity': '1'}, 300); // hide active
          } else {
            // deactivate toggled button in group
            var groupName = $(this).attr('class');
            var group = $('.'+groupName).not(this);
            $(group).parent().data('active', false)
              .find('.imgButton-inactive').stop().animate({'opacity': '1'}, 300); // hide active
                
            // mark this as active
            obj.data('active', true);
            // repaint
            divContainer.find('.imgButton-inactive').stop().animate({'opacity': '0'}, 300); // reveal active
          }
        });
      }      
    });
    */
    }
    
    $.fn.imgButton.defaults = {
        src: "",
        width: '0px',
        height: '0px',
        label: "",
        labelRight: false,
        group: "", // radio-like grouping
        href: "", // shortcut for click()
        fadeTime: 300,
    }
    
})(jQuery); 