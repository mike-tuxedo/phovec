var App = Ember.Application.create({
  ready: function() {
    console.log('App is ready!');
  },
  redirectUrlSec: function(route, seconds) {
    var sec = seconds;
    var countdownInterval = setInterval(function() {
      if (sec === 0) {
        clearInterval(countdownInterval);
        window.location.href = window.location.origin;
        return;
      }

      $('.countdown').text(--sec);
    }, 1000);
  },
  shortenString: function(str, length) {
    var reducedString = str.split('');
    reducedString.length = length;
    return reducedString.join('');
  }
});
