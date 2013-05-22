App.UserController = Ember.ObjectController.extend({
  init: function() {
    this.addObserver('usersCounter', function() {
      if (this.usersCounter === 1) {
        $('.user').css('width', '600px');
        $('.user').css('height', '527px');
        $('.videoWrapper').css('height', '448px');
        $('.video_options_buttons').css('width', '194px');
        $('#videoboxes').css('width', '600px');
        $('#videoboxes').css('margin-top', '40px');
        $('#control_video').css('margin-left', '198px');
        $('#control_effects').css('margin-left', '400px');
      } else if (this.usersCounter === 2) {
        $('.user').css('width', '450px');
        $('.user').css('height', '390px');
        $('.videoWrapper').css('height', '340px');
        $('.video_options_buttons').css('width', '146px');
        $('#videoboxes').css('width', '940px');
        $('#videoboxes').css('margin-top', '100px');
        $('#control_video').css('margin-left', '146px');
        $('#control_effects').css('margin-left', '298px');
      } else if (this.usersCounter === 3) {
        $('.user').css('width', '350px');
        $('.user').css('height', '350px');
        $('.videoWrapper').css('height', '290px');
        $('.video_options_buttons').css('width', '114px');
        $('#videoboxes').css('width', '1110px');
        $('#videoboxes').css('margin-top', '100px');
        $('#control_video').css('margin-left', '115px');
        $('#control_effects').css('margin-left', '230px');
      } else if (this.usersCounter === 4) {
        $('.user').css('width', '350px');
        $('.user').css('height', '350px');
        $('.videoWrapper').css('height', '290px');
        $('.video_options_buttons').css('width', '114px');
        $('#videoboxes').css('width', '790px');
        $('#videoboxes').css('margin-top', '15px');
        $('#control_video').css('margin-left', '115px');
        $('#control_effects').css('margin-left', '230px');
      } else if (this.usersCounter >= 5) {
        $('.user').css('width', '350px');
        $('.user').css('height', '350px');
        $('.videoWrapper').css('height', '290px');
        $('.video_options_buttons').css('width', '114px');
        $('#videoboxes').css('width', '1110px');
        $('#videoboxes').css('margin-top', '40px');
        $('#control_video').css('margin-left', '115px');
        $('#control_effects').css('margin-left', '230px');
      } else if (this.usersCounter === 0) {
      }
      App.Controller.user.set('usersCounter', 0);
    });
  },
  onGetMediaSuccess: function(stream) {
    var user = Users.getLocalUser();
    user.stream = stream;

    this.mediaOptions.isAdmissionMissing = false;

    if (this.mediaOptions.video === false) {
      stream.getVideoTracks()[0].enabled = false;
      $('.recordLocalAudio').show();

      $('.local video').css('opacity', '0');
    } else {
      $('.recordLocalVideo').show();
      $('.recordLocalAudio').show();
    }

    if ( typeof webkitURL !== "undefined") {
      document.getElementById('videoboxes').getElementsByTagName('div')[0].getElementsByTagName('video')[0].src = webkitURL.createObjectURL(stream);
    } else if ( typeof URL != "undefined") {
      document.getElementById('videoboxes').getElementsByTagName('div')[0].getElementsByTagName('video')[0].src = URL.createObjectURL(stream);
    } else {
      document.getElementById('videoboxes').getElementsByTagName('div')[0].getElementsByTagName('video')[0].mozSrcObject = stream;
    }

    document.getElementById('videoboxes').getElementsByTagName('div')[0].getElementsByTagName('video')[0].play();

    var user = Users.getLocalUser();

    SignalingChannel.send({
      subject: "participant:video:unmute",
      roomHash: user.roomHash,
      userHash: user.id
    });
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
    }, this.onGetMediaSuccess.bind(this), this.onGetMediaError);
  },
  stopGetMedia: function() {
    //get(0) gets the dom element from the jquery selector
    $("#local-stream").get(0).pause();
    $("#local-stream").attr("src", null);
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
      this.startGetMedia();
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

      $('.recordLocalAudio').show();

    } else {
      audioStream.enabled = false;
      $('.local .stateMute').show();

      SignalingChannel.send({
        subject: "participant:audio:mute",
        roomHash: user.roomHash,
        userHash: user.id
      });

      $('.recordLocalAudio').hide();
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
      this.startGetMedia();

      var localVideo = $('.user video');
      $('#faceDetectorOutput')[0].style.width = localVideo.css('width');
      $('#faceDetectorOutput')[0].style.height = $('video').css('height');
      $('#faceDetectorOutput')[0].style.display = 'none';
      FaceDetector.init(localVideo[0], $('#faceDetectorOutput')[0]);

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

      $('.recordLocalVideo').show();
    } else {
      videoStream.enabled = false;
      $('.local video').css('opacity', '0');

      SignalingChannel.send({
        subject: "participant:video:mute",
        roomHash: user.roomHash,
        userHash: user.id
      });

      $('.recordLocalVideo').hide();
      $('#faceDetectorOutput').hide();
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
  usersCounter: 1,
  mediaOptions: {
    audio: false,
    video: false,
    isAdmissionMissing: true
  }
});
