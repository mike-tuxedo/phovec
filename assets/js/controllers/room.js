App.RoomController = Ember.ObjectController.extend({
  isFaceDetactorActivated: false,
  init: function() {
  
    var controller = this;
    
    window.addEventListener("videostream:available", function(e){
      
      var localVideo = $('.user video');
      $('#faceDetectorOutput')[0].style.width = localVideo.css('width');
      $('#faceDetectorOutput')[0].style.height = $('video').css('height');
      $('#faceDetectorOutput')[0].style.display = 'none';
      FaceDetector.init(localVideo[0], $('#faceDetectorOutput')[0]);
      
      controller.showInvitationQRCode();
      
      $('#videoboxes')[0].addEventListener('mouseup',controller.handleClickEvent,false); // video-recording
      
      $('#videoEffects').show();
      
    },false);
    
    var loop = setInterval(function(){
    
      if( $('#mail_form')[0] ){
        App.Controller.auth.createHiddenTextInput();
        clearInterval(loop);
      }
    },500);
    
  },
  animation: function() {
    var interval = setInterval(function() {
      animate($('#show_sidebar'));
    }, 3000);

    function animate(item) {
      if (parseInt($('#social_sidebar_container').css('right')) > -150) {
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
  putClassesOnUser: function() {
    this.putUserStreamOnDetector('classes');
  },
  putHairOnUser: function() {
    this.putUserStreamOnDetector('hair');
  },
  putBeardOnUser: function() {
    this.putUserStreamOnDetector('beard');
  },
  takeOffClothesOfUser: function() {
    $('video')[0].style.display = 'inline';
    $('#faceDetectorOutput')[0].style.display = 'none';
    $('#videoEffectsBar').css('margin-top', '250px');
    $('#takeOffClothesButton').hide();
    $('#snapshotButton').show();
    FaceDetector.closing = true;
    this.isFaceDetactorActivated = false;
  },
  putUserStreamOnDetector: function(type) {
    //$('#videoEffectsBar').css('margin-top', '0px');
    $('video')[0].style.display = 'none';
    $('#takeOffClothesButton').show();
    $('#snapshotButton').hide();
    FaceDetector.closing = false;
    if (Users.users && Users.users[0].stream){
      FaceDetector.getStream(Users.users[0].stream, type);
      this.isFaceDetactorActivated = true;
    }
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
        obj.color = '#999999'; // reference-color for videoboxes
        obj.videoNum = obj.videos.length;
        
        controller.startSnapshotWorker(obj, function(e) {
          
          if (e && !e.data) {
            console.log("RoomController takeScreenShotFromChatroom: error happend", e);
            return;
          }
          
          if (e.data.progress) {
            $('#progressSnapshotbar').attr('value', e.data.progress);
            return;
          } else {
            $('#progressSnapshotbar').hide();
            $('#progressSnapshotbar').attr('value', 0);
          }
          
          console.log('RoomController takeScreenShotFromChatroom: coords found: ',e.data);
          
          var ctx = canvas.getContext('2d');
          
          e.data.coords.forEach(function(coord, index) {
            if(obj.videos[index].style.display !== 'none'){
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
  startSnapshotWorker: function(obj,callback){
        
    var snapshotWorker = new Worker('assets/js/helpers/snapshot_worker.js');
    
    snapshotWorker.postMessage({
      image_data: (obj.canvas.getContext('2d').getImageData(0, 0, obj.canvas.width, obj.canvas.height)),
      color: obj.color, /* videobox-color */
      videoNum: obj.videoNum 
    });

    snapshotWorker.onmessage = callback;
  },
  drawVideoboxOnCanvas : function(video,ctx,x,y,width,height){
    ctx.drawImage(
      video, 0, 0, video.videoWidth, video.videoHeight, // source: x, y, width, height
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
  hideSymbolsForWorker: function(){
    $('.videoWrapper').children().hide();
    $('.videoWrapper').css('background','#999999'); // #999999 reference-color for snapshot-worker
  },
  showVisibleSymbolsAgain: function(){
  
    $('.videoWrapper').css('background','');
    
    var localUser = Users.getLocalUser();
    
    if( localUser.stream.getVideoTracks()[0].enabled ){ // when video is activated activate video-recording-button
      $('.recordLocalVideo').show();
    }
    
    if( localUser.stream.getAudioTracks()[0].enabled ){ // when audio is activated activate audio-recording-button
      $('.recordLocalAudio').show(); 
    }
    else{
      $('#'+localUser.id+' .stateMute').show();
    }
    
    // show recording buttons of remote users whether they have switched on their video/audio
    var remoteUsers = Users.getRemoteUsers();
    
    for(var r = 0; r < remoteUsers.length; r++){
      this.handleRemoteRecordingButtons(remoteUsers[r].id);
    }
    
    $('.removeParticipant').show(); // only host has got these images so this code does not work on guests
    $('video').show();
    
  },
  handleRemoteRecordingButtons: function(remoteId){
  
    var remoteUser = Users.getRemoteUser(remoteId);
    
    if( remoteUser.stream.getVideoTracks()[0].enabled ){ // when video is activated activate video-recording-button
      $('#'+remoteId+' .recordRemoteVideo').show();
    }
    
    if( remoteUser.stream.getAudioTracks()[0].enabled ){ // when audio is activated activate audio-recording-button
      $('#'+remoteId+' .recordRemoteAudio').show(); 
    }
    else{
      $('#'+remoteId+' .stateMute').show();
    }
    
  },
  showInvitationQRCode: function() {
  
    if($('#qrcode_box').children()[0]){
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
      }
    );
    
    var alteredURL = location.href;
    alteredURL = alteredURL.replace('#','%23');
    qr.text("qrcode_box", 'Raum-Adresse zur Einladung:\n' + alteredURL);
  
  },
  handleClickEvent: function(e){
    
    // record video or audio
    if(e.target.className.indexOf('record') !== -1){
      var type = (e.target.className.indexOf('Video') !== -1) ? 'video' : 'audio';
      App.Controller.room.toggleRecorder.call(App.Controller.room, e.target, type);
    }
    
  },
  toggleRecorder: function(element,type){
  
    if(!VARecorder.recording){
      this.startRecording(element,type);
    }
    else{
      this.stopRecording(element,type);
    }
  },
  startRecording: function(element,type){
    
    var tagToTrack = $(element);
    tagToTrack.css('background', 'url(./assets/img/record_'+type+'.png)');
    tagToTrack.css('background-repeat', 'no-repeat');
    
    if(type === 'video'){
      var videoTag = tagToTrack.parent().children('video');
      VARecorder.recordVideo(videoTag[0], type);
    }
    else{
      var audioTag = tagToTrack.parent().children('audio');
      audioTag.attr('muted', false);
      audioTag.attr('volume', 1);
      var user = Users.getRemoteUser(tagToTrack.parent().parent().attr('id'));
      var stream = user ? user.stream : Users.getLocalUser().stream; // if user want to record remote-user then user-object must not be undefined
      audioTag.attr('src', URL.createObjectURL(stream));
      audioTag[0].play();
      VARecorder.recordVideo(stream, type);
    }
  },
  stopRecording: function(element,type){
    
    var tagToTrack = $(element);
    tagToTrack.css('background', 'url(./assets/img/stop_record_'+type+'.png)');
    tagToTrack.css('background-repeat', 'no-repeat');
    
    if(type === 'audio'){
      var audioTag = tagToTrack.parent().children('audio');
      audioTag.attr('muted', true);
      audioTag.attr('volume', 0);
      audioTag[0].pause();
    }
    
    VARecorder.stopRecording();
  },
  insertSpeechToTextAt: function(id){
    
    if (typeof webkitSpeechRecognition !== 'undefined'){

      var recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      var recordedText = '';
      var recognizing = false;
      
      recognition.onstart = function() {
        recognizing = true;
      };

      recognition.onerror = function(event) {
        trace('RoomController insertSpeechToTextAt: SpeechRecognition-Error',event);
      };

      recognition.onend = function() {
      };

      recognition.onresult = function(event) {
      
          var interim_transcript = '';
          
          if( typeof event.results === 'undefined') {
            recognition.onend = null;
            recognition.stop();
            trace('RoomController insertSpeechToTextAt: SpeechRecognition-Error',event);
            return;
          }
          
          for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              recordedText += event.results[i][0].transcript;
            } else {
              recordedText += event.results[i][0].transcript;
            }
          }
          console.log('recorded Text:',recordedText);
          /*final_transcript = capitalizeText(final_transcript);
          final_span.innerHTML = makeLinebreak(final_transcript);
          interim_span.innerHTML = makeLinebreak(interim_transcript);
          */
      };
        
      recognition.start();
      
    }
    else{
      trace('RoomController insertSpeechToTextAt: SpeechRecognition-Error',event);
    }
  },
  capitalizeText: function(text){
    var allSigns = /\S/;
    return text.replace(allSigns, function(s) { return s.toUpperCase(); });
  },
  makeLinebreak: function(text){
  
  }
});
