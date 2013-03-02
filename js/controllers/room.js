App.RoomController = Ember.ObjectController.extend({
  initDone: false,
  init: function() {
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
