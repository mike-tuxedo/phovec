App.RoomController = Ember.ObjectController.extend({
  init: function() {
  },
  animation: function() {
    var interval = setInterval(function() {
      animate($('#glow'));
    }, 3000);

    function animate(item) {
      if (parseInt($('#social_sidebar_container').css('right')) === 0) {
        clearInterval(interval);
      } else {
        item.animate({
          boxShadow: '0 0 200px rgba(255,0,0,0.5)'
        }, 3000, function() {
          item.css('box-shadow', '0 0 0px rgba(255,0,0,1)')
        });
      }
    }

  },
  addRemoteUsers: function() {
    var users = Users.getRemoteUsers();
    users.forEach.call(this, function(user, index, users) {
      this.addRemoteUser(user, index);
    });
  },
  addRemoteUser: function(user, index) {
    var img = './assets/img/countries/' + (user.country ? user.country : "unknown") + '.png';

    var source = $('#remoteUserTemp').html();
    var template = Handlebars.compile(source);

    var data = {
      "img": img,
      "userNumber": index + 1,
      "remoteUserName": user.name,
      "remoteUserId": user.id
    };

    var result = template(data);
    $('#videoboxes').append(result);

    if (Users.getLocalUser().admin !== true) {
      $('#' + user.id + ' .removeParticipant').hide();
    }

    var boxes = document.getElementsByClassName('user').length;
    window.App.Controller.user.set('userBoxes', boxes-1);
    console.log(boxes);
    
  },
  takeScreenShotFromChatroom: function() {

    var controller = this;

    controller.hideSymbolsForWorker();

    html2canvas([document.getElementById('videoboxes')], {
      onrendered: function(canvas) {

        controller.showVisibleSymbolsAgain();

        var obj = {};
        obj.videos = $('video');
        obj.canvas = canvas;
        obj.color = '#999999';
        // reference-color for videoboxes
        obj.videoNum = obj.videos.length;

        controller.startSnapshotWorker(obj, function(e) {

          if (e && !e.data) {
            trace("RoomController takeScreenShotFromChatroom: error happend", e);
            return;
          }

          if (e.data.progress) {
            $('#progressSnapshotbar').attr('value', e.data.progress);
            return;
          } else {
            $('#progressSnapshotbar').hide();
            $('#progressSnapshotbar').attr('value', 0);
          }

          trace('RoomController takeScreenShotFromChatroom: coords found: ', e.data);

          var ctx = canvas.getContext('2d');

          var formatedCoors = e.data.coords.slice(1, e.data.coords.length);
          // wrong order of coords resort coords
          formatedCoors.push(e.data.coords[0]);

          formatedCoors.forEach(function(coord, index) {
            if (obj.videos[index].style.display !== 'none') {
              controller.drawVideoboxOnCanvas(obj.videos[index], ctx, coord.startX, coord.startY, e.data.cellWidth, e.data.cellHeight);
            }
          });

          window.open(canvas.toDataURL(), 'Snapshot', ('width=' + canvas.width + ', height=' + canvas.height + ',menubar=1,resizable=0,scrollbars=0,status=0'));

        });

      },
      taintTest: true,
      allowTaint: true,
      letterRendering: true,
      background: '#00f'
    });
  },
  startSnapshotWorker: function(obj, callback) {

    var snapshotWorker = new Worker('assets/js/helpers/snapshot_worker.js');

    snapshotWorker.postMessage({
      image_data: (obj.canvas.getContext('2d').getImageData(0, 0, obj.canvas.width, obj.canvas.height)),
      color: obj.color, /* videobox-color */
      videoNum: obj.videoNum
    });

    snapshotWorker.onmessage = callback;
  },
  drawVideoboxOnCanvas: function(video, ctx, x, y, width, height) {
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, // source: x, y, width, height
    x, y, // destination: x, y
    width, // // destination: width
    height // // destination: height
    );
  },
  kickParticipant: function() {
    var remoteUserId = $().attr('id');

    SignalingChannel.send({
      subject: "participant-kick",
      roomHash: Users.getLocalUser().roomHash,
      userHash: Users.getLocalUser().id,
      destinationHash: remoteUserId
    });
  },
  hideSymbolsForWorker: function() {
    $('.videoWrapper').children().hide();
    $('.videoWrapper').css('background', '#999999');
    // #999999 reference-color for snapshot-worker
  },
  showVisibleSymbolsAgain: function() {

    $('.videoWrapper').css('background', '');
    $('.bgAvatar').show();

    var localUser = Users.getLocalUser();

    if (localUser.stream.getVideoTracks()[0].enabled) {// when video is activated activate video-recording-button
      $('.recordLocalVideo').show();
    }

    if (localUser.stream.getAudioTracks()[0].enabled) {// when audio is activated activate audio-recording-button
      $('.recordLocalAudio').show();
    } else {
      $('#' + localUser.id + ' .stateMute').show();
    }

    // show recording buttons of remote users whether they have switched on their video/audio
    var remoteUsers = Users.getRemoteUsers();

    for (var r = 0; r < remoteUsers.length; r++) {
      this.handleRemoteRecordingButtons(remoteUsers[r].id);
    }

    $('video').show();
    $('.videoWrapper form').show();
    $('.removeParticipant').show();
    // only host has got these images so this code does not work on guests

  },
  handleRemoteRecordingButtons: function(remoteId) {

    var remoteUser = Users.getRemoteUser(remoteId);

    if (remoteUser && remoteUser.stream) {
      if (remoteUser.stream.getVideoTracks()[0].enabled) {// when video is activated activate video-recording-button
        $('#' + remoteId + ' .recordRemoteVideo').show();
      }
      if (remoteUser.stream.getAudioTracks()[0].enabled) {// when audio is activated activate audio-recording-button
        $('#' + remoteId + ' .recordRemoteAudio').show();
      } else {
        $('#' + remoteId + ' .stateMute').show();
      }
    }

  },
  showInvitationQRCode: function() {

    if ($('#qrcode_box').children()[0]) {
      return;
    }

    var qr = new qrcode({
      size: 150,
      /*
       * L - [Default] Allows recovery of up to 7% data loss
       * M - Allows recovery of up to 15% data loss
       * Q - Allows recovery of up to 25% data loss
       * H - Allows recovery of up to 30% data loss */
      ec_level: "L",
      margin: 1
    });

    var alteredURL = location.href;
    alteredURL = alteredURL.replace('#', '%23');
    qr.text("qrcode_box", alteredURL);

  },
  handleClickEvent: function(e) {

    // record video or audio
    if (e.target.tagName === 'DIV' && e.target.className.indexOf('record') !== -1) {
      var type = (e.target.className.indexOf('Video') !== -1) ? 'video' : 'audio';
      App.Controller.room.toggleRecorder.call(App.Controller.room, e.target, type);
    }
    // transform speech to text
    else if (e.target.tagName === 'INPUT' && e.target.className === 'micro_recorder') {
      App.Controller.room.toggleSpeechToText.call(App.Controller.room, e.target);
    }

  },

  /* video/audio recording methods */

  toggleRecorder: function(element, type) {
    if (!VARecorder.recording) {
      this.startRecording(element, type);
    } else {
      this.stopRecording(element, type);
    }
  },
  startRecording: function(element, type) {
    var tagToTrack = $(element);
    tagToTrack.css('background', 'url(./assets/img/record_' + type + '.png)');
    tagToTrack.css('background-repeat', 'no-repeat');

    if (type === 'video') {
      var videoTag = tagToTrack.parent().children('video');
      VARecorder.recordVideo(videoTag[0], type);
    } else {
      var audioTag = tagToTrack.parent().children('audio');
      audioTag.attr('muted', false);
      audioTag.attr('volume', 1);
      var user = Users.getRemoteUser(tagToTrack.parent().parent().attr('id'));
      var stream = user ? user.stream : Users.getLocalUser().stream;
      // if user want to record remote-user then user-object must not be undefined
      audioTag.attr('src', URL.createObjectURL(stream));
      audioTag[0].play();
      VARecorder.recordVideo(stream, type);
    }
  },
  stopRecording: function(element, type) {
    var tagToTrack = $(element);
    tagToTrack.css('background', 'url(./assets/img/stop_record_' + type + '.png)');
    tagToTrack.css('background-repeat', 'no-repeat');

    if (type === 'audio') {
      var audioTag = tagToTrack.parent().children('audio');
      audioTag.attr('muted', true);
      audioTag.attr('volume', 0);
      audioTag[0].pause();
    }

    VARecorder.stopRecording();
  },

  /* speech to text methods */

  toggleSpeechToText: function(element) {

    if (!this.isSpeechRecognizerInitalized) {
      this.initializeSpeechRecognizer();
      this.insertSpeechToTextAt(element);
    } else if (this.isSpeechRecognizerStarted) {
      this.speechRecognizer.stop();

      if (!this.isMicroButtonRecording(element)) {
        var call = function() {
          this.insertSpeechToTextAt(element);
        }.bind(this);
        setTimeout(call, 200);
      }
    } else if (this.isSpeechRecognizerInitalized && !this.isSpeechRecognizerStarted) {
      this.insertSpeechToTextAt(element);
    }

  },
  insertSpeechToTextAt: function(element) {

    var controller = this;
    var inputField = $($(element).parent().children('div')[1]);

    if ( typeof webkitSpeechRecognition !== 'undefined') {

      controller.speechRecognizer.onerror = controller.speechRecognizerErrorHandler;
      controller.speechRecognizer.onend = function() {
        controller.isSpeechRecognizerStarted = false;
        controller.enableSpeechButtons();
      };

      controller.speechRecognizer.onstart = function() {
        controller.isSpeechRecognizerStarted = true;
        element.src = 'assets/img/micro_recorder_on.png';
      };

      controller.speechRecognizer.onresult = function(event) {

        var speechText = '';

        if ( typeof event.results === 'undefined') {
          controller.speechRecognizer.onend = null;
          controller.speechRecognizer.stop();
          trace('RoomController insertSpeechToTextAt: SpeechRecognition-Error', event);
          return;
        }

        for (var i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            speechText = event.results[i][0].transcript;
          } else if (event.results[i][0].transcript.indexOf('lösche Text') !== -1) {
            inputField.html("");
            controller.toggleResultEventMethodOfSpeechRecognizer(controller.speechRecognizer.onresult);
          }
        }

        inputField.html((inputField.html() + speechText));
        inputField.scrollTop(inputField[0].scrollHeight);

      };

      if (!controller.isSpeechRecognizerStarted) {
        controller.speechRecognizer.start();
      }
    } else {
      trace('RoomController insertSpeechToTextAt: SpeechRecognition-Error', event);
    }
  },
  speechRecognizerErrorHandler: function(e) {
    trace('RoomController: SpeechRecognition-Error ', event);
  },
  toggleResultEventMethodOfSpeechRecognizer: function(reference) {
    var controller = this;
    controller.speechRecognizer.onresult = null;
    setTimeout(function() {
      controller.speechRecognizer.onresult = reference
    }, 1800);
  },
  enableSpeechButtons: function() {
    setTimeout(function() {
      $('.micro_recorder').attr('src', 'assets/img/micro_recorder_off.png');
    }, 20);
  },
  isMicroButtonRecording: function(element) {
    return element.src.indexOf('micro_recorder_on.png') !== -1;
  },
  handleGeneralSpeechOrders: function() {

    var controller = this;
    controller.speechRecognizer.onerror = controller.speechRecognizerErrorHandler;
    controller.speechRecognizer.onend = function() {
      controller.isSpeechRecognizerStarted = false;
      $('#speechButton').val('Sprachbefehle off');
    };

    controller.speechRecognizer.onstart = function() {
      controller.isSpeechRecognizerStarted = true;
      $('#speechButton').val('Sprachbefehle on');
    };

    controller.speechRecognizer.onresult = function(event) {

      if ( typeof event.results === 'undefined') {
        controller.speechRecognizer.onend = null;
        controller.speechRecognizer.stop();
        trace('RoomController handleGeneralSpeechOrders: SpeechRecognition-Error', event);
        return;
      }

      var spokeOrder = '';

      for (var i = event.resultIndex; i < event.results.length; ++i) {
        spokeOrder += event.results[i][0].transcript;
      }

      spokeOrder = spokeOrder.toLowerCase();

      if (controller.doesContainWord(spokeOrder, 'sprachbefehl')) {// signal word that sentence must contain

        // video/audio recording of myself or remote users
        if (controller.doesContainWord(spokeOrder, 'video') || controller.doesContainWord(spokeOrder, 'audio')) {
          
          if(controller.doesContainWord(spokeOrder, 'aufnahme')){
            if (controller.doesContainWord(spokeOrder, 'start')) {
              controller.executeSpeechOrder('recordUser', spokeOrder);
            } else if (controller.doesContainWord(spokeOrder, 'stop')) {
              controller.executeSpeechOrder('stopRecordingUser', spokeOrder);
            }
            
            // switch on/off local-video or local-audio
          } else if (controller.doesContainWord(spokeOrder, 'an') || controller.doesContainWord(spokeOrder, 'aus') ) {
              controller.executeSpeechOrder('switchLocalMedia', spokeOrder);
          } 
          
        }
        // show help pop-up-window
        else if ( controller.doesContainWord(spokeOrder, 'hilfe') ) {
          controller.executeSpeechOrder('help', spokeOrder);
        }
        // hang up
        else if (controller.doesContainWord(spokeOrder, 'umbenennen')) {
          controller.executeSpeechOrder('rename', spokeOrder);
        }
        // hang up
        else if (controller.doesContainWord(spokeOrder, 'auflegen')) {
          controller.executeSpeechOrder('hangUp', spokeOrder);
        }

      }

    };

    if (!controller.isSpeechRecognizerStarted) {
      controller.speechRecognizer.start();
    }

  },
  doesContainWord: function(sentence, word) {
    return sentence.indexOf(word) !== -1;
  },
  executeSpeechOrder: function(order, sentence) {

    var controller = this;

    // is necessary because of sentences that came after an execution is in process
    if (controller.isSpeechOrderInExecution) {
      return;
    }
    controller.isSpeechOrderInExecution = true;
    setTimeout(function() {
      controller.isSpeechOrderInExecution = false;
    }, 3000);

    switch(order) {
      case 'recordUser':

        var medium = controller.doesContainWord(sentence, 'video') ? 'video' : 'audio';
        var numberPosition = sentence.search(/\d{1,1}/);
        var tagclass;
        var user;

        if (numberPosition === -1) {
          tagclass = medium === 'video' ? 'recordLocalVideo' : 'recordLocalAudio';
          user = Users.getLocalUser();
        } else {
          tagclass = medium === 'video' ? 'recordRemoteVideo' : 'recordRemoteAudio';
          var userNumber = Number(sentence.slice(numberPosition, numberPosition + 1)) - 1;
          user = Users.getRemoteUsers()[userNumber];
        }

        controller.toggleRecorder($('#'+user.id+' .'+tagclass)[0], medium);

        break;

      case 'stopRecordingUser':

        $('.recordLocalVideo').css('background', 'url(./assets/img/stop_record_video.png)');
        $('.recordLocalAudio').css('background', 'url(./assets/img/stop_record_audio.png)');
        $('.recordRemoteVideo').css('background', 'url(./assets/img/stop_record_video.png)');
        $('.recordRemoteAudio').css('background', 'url(./assets/img/stop_record_audio.png)');

        VARecorder.stopRecording();

        break;
      
      case 'switchLocalMedia':
        
        var medium = controller.doesContainWord(sentence, 'video') ? 'video' : 'audio';
        var switchMode = controller.doesContainWord(sentence, 'an') ? 'on' : 'off';
        
        if( medium === 'video' ){
        
          if(!FaceDetector.closed){
            $('#faceDetectorOutput').toggle();
          }
          
          var localUserVideoStream = Users.getLocalUser().stream.getVideoTracks()[0];
          
          if( switchMode === 'on' && !localUserVideoStream.enabled ){
            App.Controller.user.controlVideo();
          }
          else if( switchMode === 'off' && localUserVideoStream.enabled ){
            App.Controller.user.controlVideo();
          }
          
        }
        else{
        
          var localUserAudioStream = Users.getLocalUser().stream.getAudioTracks()[0];
          
          if( switchMode === 'on' && !localUserAudioStream.enabled ){
            App.Controller.user.controlAudio();
          }
          else if( switchMode === 'off' && localUserAudioStream.enabled ){
            App.Controller.user.controlAudio();
          }
          
        }
        
        break;
      
      case 'help':
      
        $('#help').fadeIn('fast');
        break;
        
      case 'rename':

        $('#nameArea').show();
        break;

      case 'hangUp':

        controller.speechRecognizer.stop();
        App.handleURL('/room/hangup');
        App.Router.router.replaceURL('/room/hangup');

        break;

    };
  },
  initializeSpeechRecognizer: function() {

    this.speechRecognizer = new webkitSpeechRecognition();
    this.speechRecognizer.continuous = true;
    this.speechRecognizer.interimResults = true;
    this.isSpeechRecognizerInitalized = true;

  },
  isSpeechOrderInExecution: false,
  isSpeechRecognizerInitalized: null,
  isSpeechRecognizerStarted: false,
  updateUser: function(data, userNum) {
    var videoBoxHead = $('#' + data.userId + ' span');
    videoBoxHead.css('background-image', 'url(./assets/img/countries/' + data.country + '.png)');
    videoBoxHead.html(userNum + '.' + data.name);
  }
});
