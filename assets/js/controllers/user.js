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
    /*
     if(Users.users.length > 1){
     for(i=1; i <= Users.users.length-1; i++){
     console.log('try adding stream');
     Users.users[i].peerConnection.removeStream(Users.users[0].stream);
     Users.users[i].peerConnection.addStream(stream);
     }
     }*/
    /* after user allows camera and mic, we disable the infobox and the black overlayfilter*/
    $('#infoField').fadeOut();
    $('#blackFilter').fadeOut();
    $('#videoboxes').animate({
      opacity: '1'
    }, 500);
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
  muteAudio: function() {
    if ($('video').prop('muted') === false) {
      console.log('LocalMedia: Your audio should be muted for others');
      $('video').prop('muted', true);
    } else {
      console.log('LocalMedia: Your audio should be unmuted for others');
      $('video').prop('muted', false);
    }
  },
  hideVideo: function() {
    console.log('LocalMedia: Your video should be hidden for you and others');
    if (Users.users[0].stream.ended === false) {
      Users.users[0].stream.stop();

      console.log('stream stopped');
    } else {
      console.log('stream plays again, hopefully');
      $('video').get(0).play();

      navigator.getMedia({
        audio: false,
        video: true
      }, this.onGetMediaSuccess, this.onGetMediaError);
    }
  },
  usersCounter: 0
});