App.RoomController = Ember.ObjectController.extend({
	init:function(){
		if (typeof webkitRTCPeerConnection != "undefined") {
		  PeerConnection = webkitRTCPeerConnection;
		} else if (mozRTCPeerConnection != "undefined") {
		  PeerConnection = mozRTCPeerConnection;
		}
		
		if (navigator.getUserMedia != "undefined") {
		  navigator.getMedia = navigator.getUserMedia;
		} else if (navigator.webkitGetUserMedia != "undefined") {
		  navigator.getMedia = navigator.webkitGetUserMedia;
		} else if (navigator.mozGetUserMedia != "undefined") {
		  navigator.getMedia = navigator.mozGetUserMedia;
		} else if (navigator.msGetUserMedia != "undefined") {
		  navigator.getMedia = navigator.msGetUserMedia;
		}
	}	
});