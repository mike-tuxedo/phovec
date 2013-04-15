/**
 * Enables URLs without the # sign - only on server possible!
 */
// App.Router.reopen({
  // location: 'history'
// });App.Router.map(function() {
  this.route("about");
  this.route('rooms', {
    path: "/rooms"
  });
  this.route('room', {
    path: "/room/:roomhash"
  });
  this.route('room-unknown', {
    path: "/room/unknown"
  });
  this.route('room-full', {
    path: "/room/full"
  });
  this.route("room-hangup", {
    path: "/room/hangup"
  });
  this.route("error");
});

App.ApplicationRoute = Ember.Route.extend({
  enter: function() {
    App.Controller = {};
  }
});

App.IndexRoute = Ember.Route.extend({
  enter: function() {
    WebRTC.hangup();
    SignalingChannel.close();
  }
});

App.RoomsRoute = Ember.Route.extend({
  enter: function() {
    WebRTC.init();
    SignalingChannel.init();
  }
});

App.RoomRoute = Ember.Route.extend({
  enter: function() {
    WebRTC.init();
    SignalingChannel.init();

    App.Controller.auth = App.AuthController.create();
    App.Controller.room = App.RoomController.create();
    App.Controller.room.animation();
    App.Controller.user = App.UserController.create();

    /*set a black background to let the user focus on the infofield an add a event for get info and background away*/
    $('#blackFilter').css('display', 'block');
    $(window).click(function() {
      $('#infoField').css('text-shadow', '0px 0px 20px #fff');
    });
  }
});

App.RoomHangupRoute = Ember.Route.extend({
  enter: function() {
    WebRTC.hangup();
    SignalingChannel.close();
    App.redirectUrlSec('', 5);
  }
});

App.RoomFullRoute = Ember.Route.extend({
  enter: function() {
    App.redirectUrlSec('', 5);
  }
});

App.ErrorRoute = Ember.Route.extend({
  enter: function() {
    App.redirectUrlSec('', 5);
  }
});

App.RoomUnknownRoute = Ember.Route.extend({
  enter: function() {
    App.redirectUrlSec('', 5);
  }
});
