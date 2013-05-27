App.RoomView = Ember.View.extend({
  templateName: 'room',
  classNames: ['room-wrapper'],
  sidebar: false,
  showSidebar: function() {
    if (this.sidebar === false) {
      $('#scrollbar_fix').css('width', '310px');
      $('#social_sidebar_container').animate({
        right: '0px'
      }, {
        duration: 250,
        queue: false
      });
      $('#hangupButton').animate({
        marginRight: '300px'
      }, {
        duration: 250,
        queue: false
      });
      $('#show_sidebar').removeClass('sidebar_close').addClass('sidebar_open');
      $('#show_sidebar_shadow').hide();

      $('#show_sidebar').mouseover(function() {
        $('#show_sidebar').css('opacity', '1')
      });
      $('#show_sidebar').mouseout(function() {
        $('#show_sidebar').css('opacity', '0.3')
      });
      this.sidebar = true;
    } else {
      $('#social_sidebar_container').animate({
        right: '-300px'
      }, {
        duration: 250,
        queue: false
      });
      $('#hangupButton').animate({
        marginRight: '0px'
      }, {
        duration: 250,
        queue: false
      });
      $('#scrollbar_fix').animate({
        width: '45px'
      }, {
        duration: 250,
        queue: false
      });
      $('#show_sidebar').removeClass('sidebar_open').addClass('sidebar_close');
      $('#show_sidebar_shadow').show();

      $('#show_sidebar').mouseout(function() {
        $('#show_sidebar').css('opacity', '1')
      });
      this.sidebar = false;
    }
  },
  openHelp: function() {
    $('#help').fadeIn('fast');
  },
  closeHelp: function() {
    $('#help').fadeOut('fast');
  },
  didInsertElement: function() {
    if (Users.getLocalUser().name === "Phovec-Benutzer" || Users.getLocalUser().name === undefined) {
      $('#nameArea').show();
    }
    window.App.Controller.room.addRemoteUsers();
  },
  toggleFullscreen: function() {
    var documentElement = document.getElementsByTagName("body")[0];
    console.log("toggle", (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement));
    if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) {// current working methods
      if (documentElement.requestFullscreen) {
        documentElement.requestFullscreen();
      } else if (documentElement.mozRequestFullScreen) {
        documentElement.mozRequestFullScreen();
      } else if (documentElement.webkitRequestFullscreen) {
        documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      }
      document.getElementById("buttonFullscreen").style.backgroundImage = "url('assets/img/fullscreen_exit.png')";
    } else {
      if (document.cancelFullScreen) {
        document.cancelFullScreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
      document.getElementById("buttonFullscreen").style.backgroundImage = "url('assets/img/fullscreen_start.png')";
    }
  },
  toggleSpeechOrder: function() {

    if (App.Controller.room.isSpeechRecognizerStarted) {
      App.Controller.room.speechRecognizer.stop();
    } else {

      if (!this.isSpeechRecognizerInitalized) {
        App.Controller.room.initializeSpeechRecognizer();
      }

      App.Controller.room.handleGeneralSpeechOrders();
    }
  },
  keyUp: function(event) {
    if (event.target === document.querySelector("#nameArea #name")) {
      var element = document.querySelector("#nameArea #startButtonImage");
      if (document.querySelector("#nameArea #name").value.length >= 3) {
        element.onmouseover = function() {
          this.style.opacity = 0.8;
        };
        element.onmouseout = function() {
          this.style.opacity = 1;
        };
        element.onclick = function() {
          var name = document.querySelector("#nameArea #name").value;
          var localUser = Users.getLocalUser();
          localUser.name = name;

          if (Users.initLocalUser === false) {
            Users.initLocalUser = true;
            SignalingChannel.send({
              subject: "init:user",
              roomHash: localUser.roomHash,
              name: localUser.name
            });
          } else if (Users.initLocalUser === true) {// user wants to rename their name
            SignalingChannel.send({
              subject: "participant:edit",
              roomHash: localUser.roomHash,
              userHash: localUser.id,
              put: {
                name: localUser.name,
              }
            });
          }

          document.querySelector("#local_name").innerText = name;
          document.getElementById("nameArea").style.display = "none";
        };
        element.style.backgroundImage = "url('assets/img/startbutton.png')";
      } else {
        element.onmouseover = null;
        element.onmouseout = null;
        element.onclick = null;
        element.style.backgroundImage = "url('assets/img/startbutton_disabled.png')";
      }
    }
  }
});
