App.UserController = Ember.ObjectController.extend({
  localStream: null,
  setLocalStream: function(stream) {
    User.set('localStream', stream);
  },
  getLocalStream: function() {
    return User.get('localStream');
  },
  onGetMediaSuccess: function(stream) {
    this.setLocalStream(stream);
    window.dispatchEvent(new CustomEvent("localmedia:available"));
    $('#local-stream').attr('src', URL.createObjectURL(stream));
  },
  onGetMediaError: function(error) {
    console.log("LocalMedia: ERROR");
    console.log(error);
  },
  startGetMedia: function() {
    //request audio and video from your own hardware
    navigator.getMedia({
      audio: true,
      video: true
    }, this.onSuccess, this.onError);
  },
  stopGetMedia: function() {
    //get(0) gets the dom element from the jquery selector
    $('#local-stream').get(0).pause();
    $('#local-stream').attr('src', null);
  }
}); 