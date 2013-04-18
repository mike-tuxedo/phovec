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
  },
  onGetMediaSuccess: function(stream) {
    this.mediaOptions.isAdmissionMissing = false;
    if (this.mediaOptions.video === false) {
      var videoStream = user.stream.getVideoTracks()[0];
      videoStream.enabled = false;
      $('.local video').css('opacity', '0');
    }

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
  startGetMedia: function(options) {
    //request audio and video from your own hardware
    navigator.getMedia({
      audio: true,
      video: true
    }, this.onGetMediaSuccess.bind(this), this.onGetMediaError);
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
        roomHash: Users.users[0].roomHash,
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
    if (user.stream === undefined && this.mediaOptions.isAdmissionMissing === false) {
      //show here maybe advice img?
      //how to enable media access again
      return;
    } else if (user.stream === undefined && this.mediaOptions.isAdmissionMissing) {
      //show here maybe advice img?
      //how to allow the media request
      this.mediaOptions.audio = true;
      this.startGetMedia({
        audio: true,
        video: false
      });
      return;
    }

    var audioStream = user.stream.getAudioTracks()[0];
    if (audioStream.enabled === false) {
      audioStream.enabled = true;
      $('.local .stateMute').hide();

      SignalingChannel.send({
        subject: "participant:audio:unmute",
        roomHash: user.roomHash,
        userHash: user.id
      });
    } else {
      audioStream.enabled = false;
      $('.local .stateMute').show();

      SignalingChannel.send({
        subject: "participant:audio:mute",
        roomHash: user.roomHash,
        userHash: user.id
      });
    }
  },
  controlVideo: function() {
    var user = Users.getLocalUser();
    if (user.stream === undefined && this.mediaOptions.isAdmissionMissing === false) {
      //show here maybe advice img?
      //how to enable media access again
      return;
    } else if (user.stream === undefined && this.mediaOptions.isAdmissionMissing) {
      //show here maybe advice img?
      //how to allow the media request
      this.mediaOptions.video = true;
      this.mediaOptions.audio = true;
      this.startGetMedia({
        audio: true,
        video: true
      });
      return;
    }

    var videoStream = user.stream.getVideoTracks()[0];
    if (videoStream.enabled === false) {
      videoStream.enabled = true;
      $('.local video').css('opacity', '1');

      SignalingChannel.send({
        subject: "participant:video:unmute",
        roomHash: user.roomHash,
        userHash: user.id
      });
    } else {
      videoStream.enabled = false;
      $('.local video').css('opacity', '0');

      SignalingChannel.send({
        subject: "participant:video:mute",
        roomHash: user.roomHash,
        userHash: user.id
      });
    }
  },
  removeParticipant: function(remoteUserId) {
    var user = Users.getLocalUser();
    Users.removeRemoteUser(remoteUserId);
    SignalingChannel.send({
      subject: "participant:remove",
      roomHash: user.roomHash,
      userHash: user.id,
      destinationHash: remoteUserId
    });
  },
  usersCounter: 0,
  mediaOptions: {
    audio: false,
    video: false,
    isAdmissionMissing: true
  }
});
