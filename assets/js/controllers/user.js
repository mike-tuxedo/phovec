App.UserController = Ember.ObjectController.extend({
  userBoxes: document.getElementsByClassName('user').length,
  windowWidth: 0,
  mediaOptions: {
    audio: false,
    video: false,
    isAdmissionMissing: true
  },
  init: function() {
    window.onresize = function(event) {
      $('.sidebar_content').css('height', $(window).height() - 30 + 'px');
      this.setWindowWidth();
    }.bind(this);

    this.addObserver('userBoxes', this.computeSize);
  },
  setWindowWidth: function() {
    this.set('windowWidth', window.document.width);
    this.computeSize();
  },
  computeSize: function() {
    if (this.userBoxes === 1 || this.userBoxes === 0) {
      var boxWidth = this.windowWidth / 2.4;
      var videoWidth = boxWidth;
      $('#videoboxes').css('width', boxWidth + 'px');

    } else if (this.userBoxes === 2) {
      var boxWidth = this.windowWidth / 1.2;
      var videoWidth = boxWidth / 2 - 20;
      $('#videoboxes').css('width', boxWidth + 'px');

    } else if (this.userBoxes === 3) {
      var boxWidth = this.windowWidth / 1.1;
      var videoWidth = boxWidth / 3 - 20;
      $('#videoboxes').css('width', boxWidth + 'px');

    } else if (this.userBoxes === 4) {
      var boxWidth = this.windowWidth / 2;
      var videoWidth = boxWidth / 2 - 20;
      $('#videoboxes').css('width', boxWidth + 'px');

    } else if (this.userBoxes >= 5) {
      var boxWidth = this.windowWidth / 1.5;
      var videoWidth = boxWidth / 3 - 20;
      $('#videoboxes').css('width', boxWidth + 'px');
    }

    this.setVideoSize(videoWidth);
  },
  setVideoSize: function(videoWidth) {
    //generell videosize
    var videoHeight = videoWidth / 1.3333;
    var videoWrapperHeight = videoHeight;
    $('.user, #videoEffects').css('width', videoWidth + 'px');
    $('.user, #videoEffects').css('height', videoHeight + 'px');
    $('.videoWrapper').css('height', videoWrapperHeight + 'px');

    //Video buttons for local user
    var buttonWidth = videoWidth / 3;
    $('.video_options_buttons').css('width', buttonWidth + 'px');

    //change fontsize in depency to the buttonwidth itself
    var font_factor = $('.video_options_buttons').width() / 8;
    if (font_factor > 15) {
      font_factor = 15;
    }
    $('#control_audio, #control_video, #control_effects').css('font-size', font_factor + 'px');
  },
  onGetMediaSuccess: function(stream) {

    this.mediaOptions.isAdmissionMissing = false;

    var user = Users.getLocalUser();
    user.stream = stream;

    user.audioVisualizer = new AudioVisualizer();
    user.audioVisualizer.setup(stream);

    if (this.mediaOptions.video === false) {
      user.audioVisualizer.start();
      stream.getVideoTracks()[0].enabled = false;

      SignalingChannel.send({
        subject: "participant:video:mute",
        roomHash: user.roomHash,
        userHash: user.id
      });

      $('.recordLocalAudio').show();
      $('.local video').css('opacity', '0');
    } else {
      $('.recordLocalVideo').show();
      $('.recordLocalAudio').show();
      $('#control_effects').removeClass('disabled');
    }

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
    $('#headerInfo').show();
    setTimeout(function(){
      $('#headerInfo').fadeOut('slow');
    }, 3000);
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
      user.audioVisualizer.start();

      SignalingChannel.send({
        subject: "participant:audio:unmute",
        roomHash: user.roomHash,
        userHash: user.id
      });

      $('.local .stateMute').hide();
      $('.recordLocalAudio').show();
    } else {
      user.audioVisualizer.stop();
      audioStream.enabled = false;

      SignalingChannel.send({
        subject: "participant:audio:mute",
        roomHash: user.roomHash,
        userHash: user.id
      });

      $('.recordLocalAudio').hide();
      $('.local .stateMute').show();
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
    var audioStream = user.stream.getAudioTracks()[0];
    if (videoStream.enabled === false) {
      user.audioVisualizer.stop();
      videoStream.enabled = true;

      SignalingChannel.send({
        subject: "participant:video:unmute",
        roomHash: user.roomHash,
        userHash: user.id
      });

      $('.local video').css('opacity', '1');
      $('#control_effects').removeClass('disabled');
      $('.recordLocalVideo').show();
    } else {
      if (audioStream.enabled === true) {
        user.audioVisualizer.start();
      }

      videoStream.enabled = false;
      SignalingChannel.send({
        subject: "participant:video:mute",
        roomHash: user.roomHash,
        userHash: user.id
      });

      $('.local video').css('opacity', '0');
      $('#control_effects').addClass('disabled');
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
  }
});
