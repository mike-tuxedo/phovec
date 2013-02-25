App.UserController = Ember.ObjectController.extend({

	  localStream: null,
	  setStream: function(stream) {
	    this.localStream = stream;
	  },
	  getStream: function() {
	    return this.localStream;
	  },
	  onSuccess: function(localStream) {
	    console.log()
	    this.setStream(localStream);
	    window.dispatchEvent(new CustomEvent("localmedia:available"));
	
	    $('#local-stream').attr('src', URL.createObjectURL(localStream));
	  },
	  onError: function(error) {
	    console.log("LocalMedia: ERROR");
	    console.log(error);
	  },
	  start: function() {
	  	console.log('try to get local videostream...');
	    //request audio and video from your own hardware
	    navigator.getMedia({
	      audio: true,
	      video: true
	    }, this.onSuccess, this.onError);
	  },
	  stop: function() {
	    //get(0) gets the dom element fromt he jquery selector
	    $('#local-stream').get(0).pause();
	    $('#local-stream').attr('src', null);
	  }

});