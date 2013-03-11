App.UserController = Ember.ObjectController.extend({
  users: [],
  init: function() {
    var user = App.User.create({
      type: "local"
    });
    this.get("users").push(user);
  },
  setLocalStream: function(stream) {
    var users = this.get("users");
    for (var i = 0; i < users.length; i++) {
      if (users[i].get("type") == "local") {
        return users[i].set("stream", stream);
      }
    }
  },
  getLocalStream: function() {
    var users = this.get("users");
    for (var i = 0; i < users.length; i++) {
      if (users[i].get("type") == "local") {
        return users[i].get("stream");
      }
    }
  },
  onGetMediaSuccess: function(stream) {
    App.Controller.user.setLocalStream(stream);
    window.dispatchEvent(new CustomEvent("localmedia:available", {
      detail: {
        stream: stream
      }
    }));

    if ( typeof webkitURL !== "undefined") {
      document.getElementById('videoboxes').getElementsByTagName('div')[0].getElementsByTagName('video')[0].src = webkitURL.createObjectURL(stream);
    } else if ( typeof URL != "undefined") {
      document.getElementById('videoboxes').getElementsByTagName('div')[0].getElementsByTagName('video')[0].src = URL.createObjectURL(stream);
    } else {
      document.getElementById('videoboxes').getElementsByTagName('div')[0].getElementsByTagName('video')[0].mozSrcObject = stream;
    }

    document.getElementById('videoboxes').getElementsByTagName('div')[0].getElementsByTagName('video')[0].play();
    /* after user allows camera and mic, we disable the infobox and the black overlayfilter*/
    $('#infoField').fadeOut();
    $('#blackFilter').fadeOut();
  },
  onGetMediaError: function(error) {
    console.log("LocalMedia: ERROR");
    console.log(error);
    
    /* check if user likes to do a textchat or not */
    if(confirm('Nach dem du keinen Zugriff auf Kamera und Mikrofon erlaubst, kannst du nur einen Textchat führen! Ist das was du OK?')) {
      $('#infoField').fadeOut();
      $('#blackFilter').fadeOut();
    }
    else {
      console.log('************ein redirect muss noch implementiert werden***********');
      alert('Zurück auf die Startseite ...');
    }
  },
  startGetMedia: function() {
    //request audio and video from your own hardware
    navigator.getMedia({
      audio: true,
      video: true
    }, this.onGetMediaSuccess, this.onGetMediaError);
  },
  stopGetMedia: function() {
    //get(0) gets the dom element from the jquery selector
    $("#local-stream").get(0).pause();
    $("#local-stream").attr("src", null);
  }
});
