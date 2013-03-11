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

    App.Controller.auth = App.AuthController.create();

    var setFB = function() {

      App.Controller.auth.set('FB', FB);

      FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {

          console.log('fb logged in');

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

    if (!window.FB) {
      setTimeout(1000, setFB);
    } else {
      setFB();
    }


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
