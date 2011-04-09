(function ($) {
	$.fn.vAlign = function(container) {
		return this.each(function(i){
			if(container == null) {
				container = 'div';
			}
			$(this).html("<" + container + ">" + $(this).html() + "</" + container + ">");
			var el = $(this).children(container + ":first");
			var elh = $(el).height(); //new element height
			var ph = $(this).height(); //parent height
			var nh = (ph - elh) / 2; //new height to apply
			$(el).css('margin-top', nh);
		});
	};
})(jQuery);


$.fn.disableSelection = function() {
    $(this).attr('unselectable', 'on')
           .css('-moz-user-select', 'none')
           .each(function() { 
               this.onselectstart = function() { return false; };
            });
};
