App.UserController = Ember.ObjectController.extend({
  init: function() {
    this.addObserver('usersCounter', function() {
      if (this.usersCounter === 1) {
        $('.user').css('width', '600px');
        $('#videoboxes').css('width', '600px');
      } else if (this.usersCounter === 2) {
        $('.user').css('width', '450px');
        $('#videoboxes').css('width', '940px');
      } else if (this.usersCounter === 3) {
        $('.user').css('width', '350px');
        $('#videoboxes').css('width', '1110px');
      } else if (this.usersCounter === 4) {
        $('.user').css('width', '350px');
        $('#videoboxes').css('width', '790px');
      } else if (this.usersCounter >= 5) {
        $('.user').css('width', '350px');
        $('#videoboxes').css('width', '1110px');
      }
    });
    this.set('usersCounter', 0);
  },
  onGetMediaSuccess: function(stream) {
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
  },
  onGetMediaError: function(error) {
    console.log("LocalMedia: ERROR");
    console.log(error);

    /* check if user likes to do a textchat or not */
    /*if(confirm('Nach dem du keinen Zugriff auf Kamera und Mikrofon erlaubst, kannst du nur einen Textchat führen! Ist das OK?')) {
     $('#infoField').fadeOut();
     $('#blackFilter').fadeOut();
     }
     else {
     console.log('************ein redirect muss noch implementiert werden***********');
     alert('Zurück auf die Startseite ...');
     }*/
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
  },
  sendMail: function(mailSettings) {
    if (mailSettings.from && mailSettings.to && mailSettings.subject && mailSettings.text && mailSettings.html)
      SignalingChannel.send({
        subject: 'mail',
        chatroomHash: Users.users[0].roomHash,
        userHash: Users.users[0].id,
        mail: {
          from: mailSettings.from,
          to: mailSettings.to,
          subject: mailSettings.subject,
          text: mailSettings.text,
          html: mailSettings.html
        }
      });
  },
  controlAudio: function() {
    var user = Users.getLocalUser();
    var audioStream = user.stream.getLocalTracks()[0].getAudioTracks()[0];
    if (audioStream.enabled === false) {
      audioStream.enabled = true;
    } else {
      audioStream.enabled = false;
    }
  },
  controlVideo: function() {
    var user = Users.getLocalUser();
    var videoStream = user.stream.getLocalTracks()[0].getVideoTracks()[0];
    if (videoStream.enabled === false) {
      videoStream.enabled = true;
    } else {
      videoStream.enabled = false;
    }
  },
  usersCounter: 0
});
