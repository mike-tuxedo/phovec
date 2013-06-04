App.UserView = Ember.View.extend({
  classNames: ['user', 'local'],
  elementId: 'local',
  didInsertElement: function() {
    $('#videoboxes')[0].addEventListener('click', App.Controller.room.handleClickEvent, true);

    $('.user.local')[0].addEventListener('dblclick', App.Controller.room.showAlterNameField.bind(null, $('.user.local .userName')[0]), true);

    App.Controller.user.setWindowWidth();
    Users.updateLocalUserView();
  },
  controlEffects: function() {
    if ($('#videoEffects').css('display') === 'block') {
      $('#videoEffects').fadeOut('fast');
    } else {
      $('#videoEffects').fadeIn('fast');
    }
    this.effectOff();
    this.controlLocalVideoVisibility('inline');
  },
  controlAudio: function() {
    App.Controller.user.controlAudio();
  },
  controlVideo: function() {
    if (!FaceDetector.closed) {
      $('#faceDetectorOutput').toggle();
      console.log('toggle facedetector');
    }
    App.Controller.user.controlVideo();
  },
  controlLocalVideoVisibility: function(option) {
    var localUserId = Users.getLocalUser().id;
    $('#' + localUserId + ' video').css('display', option);
  },
  controlEffectsVisibility: function(option) {
    $('#videoEffects').css('display', option);
  },
  putGlassesOnUser: function() {
    this.putUserStreamOnDetector('glasses');
  },
  putHatOnUser: function() {
    this.putUserStreamOnDetector('hat');
  },
  putBeardOnUser: function() {
    this.putUserStreamOnDetector('beard');
  },
  effectOff: function() {
    FaceDetector.closed = true;
  },
  putUserStreamOnDetector: function(type) {
    this.controlLocalVideoVisibility('none');
    this.controlEffectsVisibility('none');
    FaceDetector.closed = false;
    if (Users.getLocalUser().stream) {
      FaceDetector.getStream(Users.getLocalUser().stream, type);
    }
  }
});
