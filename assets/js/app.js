var App = Ember.Application.create({
  ready: function() {
    console.log('App is ready!');
  },
  redirectUrlSec: function(route, seconds) {
    var sec = seconds;
    var countdownInterval = setInterval(function() {
       console.log(route, sec);
      
      if (sec === 0) {
        clearInterval(countdownInterval);
        App.handleURL(route);
        App.Router.router.replaceURL(route);
      }

      $('.countdown').text(--sec);
    }, 1000);
  }
}); 