(function($) {
  $.fn.hyphenate = function(options) {
    
    settings = $.extend({
      oWidth: this.width()
    }, options);
    
    return this.each(function(){
      
      $(this).css({
        'width': settings.oWidth,
        'display': 'block'
      });
      
      var str = '';
      $.each($(this).text().split(' '), function(i, chunk) {
        str += splitChunk(chunk) + ' ';
      });
      
      $(this).html(str);
    
    });
    function splitChunk(str) {
      if($('<span></span>').text(str).hide().appendTo(document.body).width() > settings.oWidth)
      {
        var s = '';
        var i = 0;
        while(i < str.length)
        {
          s += (str.slice(i, ++i) + '&shy;');
        }
        return s;
      }
      else
        return str;
    }
  };
})(jQuery);
