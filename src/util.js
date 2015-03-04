(function() {
  util = {
    fadeOut: function(element, speed) {
          speed = typeof speed === 'undefined' ? 20 : speed;
          var op = 1;  // initial opacity
          var timer = setInterval(function () {
              if (op <= 0.1){
                  clearInterval(timer);
                  element.style.display = 'none';
              }
              element.style.opacity = op;
              element.style.filter = 'alpha(opacity=' + op * 100 + ")";
              op -= op * 0.1;
          }, speed);
      },

      fadeIn: function(element, speed) {
          speed = typeof speed === 'undefined' ? 20 : speed;
          var op = 0.1;  // initial opacity
          var timer = setInterval(function () {
              if (op >= 1){
                  clearInterval(timer);
              }
              element.style.opacity = op;
              element.style.filter = 'alpha(opacity=' + op * 100 + ")";
              op += op * 0.1;
          }, speed);
      },

      extend: function(target) {
          var sources = [].slice.call(arguments, 1);
          sources.forEach(function (source) {
              for (var prop in source) {
                  target[prop] = source[prop];
              }
          });
          return target;
      }
  }
})();
