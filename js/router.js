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

    App.Controller.user = App.UserController.create();
    App.Controller.user.startGetMedia();
    SignalingChannel.init();

    App.Controller.auth = App.AuthController.create();
    
    var setFB = function(){
    
      App.Controller.auth.set('FB', FB);
      
      FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
        
          console.log('fb logged in');
          
          App.Controller.auth.set('fb_logged_in', true); // do not show fb-login button
          App.Controller.auth.setupFBInfo(); // and show fb-username and fb-friendlist
          
        } else if (response.status === 'not_authorized') {
          console.log('not_authorized');
        } else {
          console.log('not_logged_in');
        }
      });
      
    };
    
    if(!FB){
      setTimeout(1000,setFB);
    }
    else
      setFB();
    
  }
});

App.HangupRoute = Ember.Route.extend({
  enter: function(router) {
    WebRTC.hangup();
    SignalingChannel.close();
  }
});
