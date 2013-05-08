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
    
    $('#videoEffectsBar').css('margin-top', '250px');
    $('.videoWrapper').children().hide();
    $('.videoWrapper').css('background','#999999');
    
    html2canvas([document.getElementById('videoboxes')], {
      onrendered: function(canvas) {
        
        $('.videoWrapper').css('background','');
        $('.stateMute').show();
        $('.videoWrapper img').show();
        $('.recordLocalVideo').show();
        $('.recordLocalAudio').show();
        $('.removeParticipant').show();
        $('video').show();
        
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
  }
});
