/**
 * Enables URLs without the # sign - only on server possible!
 */
// App.Router.reopen({
// location: 'history'
// });
App.Router.map(function() {
  this.route("about");
  this.route('room');
  this.route("hangup");
  this.route("invitation");
});

App.ApplicationRoute = Ember.Route.extend({
  enter: function(router) {
    App.Controller = {};
  }
});

App.IndexRoute = Ember.Route.extend({
  enter: function(route) {
    $('#blackFilter').css('display', 'none');
  }
});

App.RoomRoute = Ember.Route.extend({
  enter: function(router) {
  
    App.Controller.room = App.RoomController.create();
    
    App.Controller.user = App.UserController.create();
    App.Controller.user.startGetMedia();
    
    App.Controller.auth = App.AuthController.create();
    
    SignalingChannel.init();

    /*set a black background to let the user focus on the infofield an add a event for get info and background away*/
    $('#blackFilter').css('display', 'block');

    $(window).click(function() {
      $('#infoField').css('text-shadow', '0px 0px 20px #fff');
    });
  }
});

App.HangupRoute = Ember.Route.extend({
  enter: function(router) {
    WebRTC.hangup();
    SignalingChannel.close();
  }
});
