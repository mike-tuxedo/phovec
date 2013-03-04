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

App.RoomRoute = Ember.Route.extend({
  enter: function(router) {
    if ( typeof webkitRTCPeerConnection != "undefined") {
      PeerConnection = webkitRTCPeerConnection;
    } else if ( typeof mozRTCPeerConnection != "undefined") {
      PeerConnection = mozRTCPeerConnection;
    }

    if ( typeof navigator.getUserMedia != "undefined") {
      navigator.getMedia = navigator.getUserMedia;
    } else if ( typeof navigator.webkitGetUserMedia != "undefined") {
      navigator.getMedia = navigator.webkitGetUserMedia;
    } else if ( typeof navigator.mozGetUserMedia != "undefined") {
      navigator.getMedia = navigator.mozGetUserMedia;
    } else if ( typeof navigator.msGetUserMedia != "undefined") {
      navigator.getMedia = navigator.msGetUserMedia;
    }

    App.Controller = {};
    App.Controller.user = App.UserController.create();
    App.Controller.user.startGetMedia();
    SignalingChannel.init();
  }
});

App.HangupRoute = Ember.Route.extend({
  enter: function(router) {
    WebRTC.hangup();
    SignalingChannel.close();
  }
});
