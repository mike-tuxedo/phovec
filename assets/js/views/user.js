App.UserView = Ember.View.extend({
  didInsertElement: function(){
    $('#videoboxes')[0].addEventListener('click',App.Controller.room.handleClickEvent,true);

    App.Controller.user.setWindowWidth();
  },
  controlEffects: function(){
    $('#videoEffects').css('display', 'block');
    $('#videoEffects').css('margin-top', '0px');
  },
  controlAudio: function(){
    App.Controller.user.controlAudio();
  },
  controlVideo: function(){
  
    if(!FaceDetector.closed){
      $('#faceDetectorOutput').toggle();
    }
    
    App.Controller.user.controlVideo();
  }
});