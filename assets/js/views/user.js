App.UserView = Ember.View.extend({
  classNames: ['user', 'local'],
  elementId: 'local',
  didInsertElement: function() {
    $('#videoboxes')[0].addEventListener('click', App.Controller.room.handleClickEvent, true);
  },
  controlEffects: function() {
    $('#videoEffects').css('display', 'block');
    $('#videoEffects').css('margin-top', '0px');
  },
  controlAudio: function() {
    App.Controller.user.controlAudio();
  },
  controlVideo: function() {
    App.Controller.user.controlVideo();
  },
  hideEffects: function() {
    $('#videoEffects').css('display', 'none');
  },
  putGlassesOnUser: function() {
    this.putUserStreamOnDetector('glasses');
  },
  putHairOnUser: function() {
    this.putUserStreamOnDetector('hair');
  },
  putBeardOnUser: function() {
    this.putUserStreamOnDetector('beard');
  },
  effectOff: function() {
    $('video')[0].style.display = 'inline';
    $('#faceDetectorOutput')[0].style.display = 'none';
    $('#takeOffClothesButton').hide();
    $('#snapshotButton').show();
    FaceDetector.closing = true;
  },
  putUserStreamOnDetector: function(type) {
    $('video')[0].style.display = 'none';
    FaceDetector.closing = false;
    if (Users.getLocalUser().stream) {
      FaceDetector.getStream(Users.getLocalUser().stream, type);
    }
  },
});
