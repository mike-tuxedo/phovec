App.UserView = Ember.View.extend({
  didInsertElement: function(){
    $('#videoboxes')[0].addEventListener('click',App.Controller.room.handleClickEvent,true);

    App.Controller.user.setWindowWidth();
  },
  controlEffects: function(){
    if($('#videoEffects').css('display') === 'block'){
      $('#videoEffects').fadeOut('fast');
    }
    else{
      $('#videoEffects').fadeIn('fast');
    }
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