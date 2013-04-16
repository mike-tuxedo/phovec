App.UserController = Ember.ObjectController.extend({
  init: function() {
    this.addObserver('usersCounter', function() {
      if (this.usersCounter === 1) {
        $('.user').css('width', '600px');
        $('.video_options_buttons').css('width', '190px');
        $('#videoboxes').css('width', '600px');
        $('#control_video').css('margin-left', '200px');
        $('#control_effects').css('margin-left', '400px');
      } else if (this.usersCounter === 2) {
        $('.user').css('width', '450px');
        $('.video_options_buttons').css('width', '140px');
        $('#videoboxes').css('width', '940px');
        $('#control_video').css('margin-left', '150px');
        $('#control_effects').css('margin-left', '300px');
      } else if (this.usersCounter === 3) {
        $('.user').css('width', '350px');
        $('.video_options_buttons').css('width', '106.66px');
        $('#videoboxes').css('width', '1110px');
        $('#control_video').css('margin-left', '116.66px');
        $('#control_effects').css('margin-left', '233.66px');
      } else if (this.usersCounter === 4) {
        $('.user').css('width', '350px');
        $('.video_options_buttons').css('width', '106.66px');
        $('#videoboxes').css('width', '790px');
        $('#control_video').css('margin-left', '116.66px');
        $('#control_effects').css('margin-left', '233.66px');
      } else if (this.usersCounter >= 5) {
        $('.user').css('width', '350px');
        $('.video_options_buttons').css('width', '106.66px');
        $('#videoboxes').css('width', '1110px');
        $('#control_video').css('margin-left', '116.66px');
        $('#control_effects').css('margin-left', '233.66px');
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
