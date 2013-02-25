App.RoomController = Ember.ObjectController.extend({
	ready:function(){
		if (webkitRTCPeerConnection) {
		  PeerConnection = webkitRTCPeerConnection;
		} else if (mozRTCPeerConnection) {
		  PeerConnection = mozRTCPeerConnection;
		}
		
		if (navigator.getUserMedia) {
		  navigator.getMedia = navigator.getUserMedia;
		} else if (navigator.webkitGetUserMedia) {
		  navigator.getMedia = navigator.webkitGetUserMedia;
		} else if (navigator.mozGetUserMedia) {
		  navigator.getMedia = navigator.mozGetUserMedia;
		} else if (navigator.msGetUserMedia) {
		  navigator.getMedia = navigator.msGetUserMedia;
		}
		
		App.user.start();
	}	
});