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
    SignalingChannel.init();

    // for setting FB-Instance and face-detector up later
    var setupAuthController = function() {
      App.Controller.auth = App.AuthController.create();
      App.Controller.auth.set('FB', FB);
      FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {

          App.Controller.auth.set('fb_logged_in', true);
          // do not show fb-login button
          App.Controller.auth.setupFBInfo();
          // and show fb-username and fb-friendlist

        } else if (response.status === 'not_authorized') {
          console.log('not_authorized');
        } else {
          console.log('not_logged_in');
        }
      });

    };

    if (!window.FB)
      setTimeout(setupAuthController, 50);
    else
      setupAuthController();

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
