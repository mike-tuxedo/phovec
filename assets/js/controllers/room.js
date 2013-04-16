App.RoomController = Ember.ObjectController.extend({
  init: function() {
    var loop = setInterval(function() {
    
      // localVideo is not available during loading templates so an interval is used
      var localVideo = $('.local video');
      console.log('localVideo: ',localVideo);
      if ( typeof FaceDetector !== 'undefined' && $('#faceDetectorOutput')[0] && localVideo && Users.getLocalUser().stream ) {
        
        $('#faceDetectorOutput')[0].style.width = localVideo.css('width');
        $('#faceDetectorOutput')[0].style.height = '250px';

        FaceDetector.init(localVideo[0], $('#faceDetectorOutput')[0]);

        clearInterval(loop);
      }
      
    }, 1000);
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
          boxShadow: '0 0 400px rgba(255,0,0,0.5)'
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
    FaceDetector.closing = true;
  },
  putUserStreamOnDetector: function(type) {
    //$('#videoEffectsBar').css('margin-top', '0px');
    $('video')[0].style.display = 'none';
    $('#takeOffClothesButton').show();
    FaceDetector.closing = false;
    if (Users.users && Users.users[0].stream)
      FaceDetector.getStream(Users.users[0].stream, type);
  },
  takeScreenShotFromChatroom: function() {
    
    var controller = this;
    
    $('#videoEffectsBar').css('margin-top', '250px');
    
    html2canvas([document.getElementById('videoboxes')], {
      onrendered: function(canvas) {
        
        $('#progressSnapshotbar').show();

        var videos = $('video');
        
        var snapshotWorker = new Worker('assets/js/helpers/snapshot_worker.js');
        
        snapshotWorker.postMessage({
          image_data: (canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)),
          color: '#999999', /* videobox-color */
          videoNum: (controller.isFaceDetactorActivated() ? (videos.length-1) : videos.length)
        });

        snapshotWorker.onmessage = function(e) {
          
          console.log('takeScreenShotFromChatroom: coords found',e.data);
          
          if (e && !e.data) {
            console.log("RoomController: takeScreenShotFromChatroom error happend", e);
          }

          if (e.data.progress) {
            $('#progressSnapshotbar').attr('value', e.data.progress);
            return;
          } else {
            $('#progressSnapshotbar').hide();
            $('#progressSnapshotbar').attr('value', 0);
          }
          
          e.data.coords.forEach(function(coord, index) {
            var ctx = canvas.getContext('2d');
            if(videos[index].style.display === 'inline'){
              controller.drawVideoboxOnCanvas(videos[index], ctx, coord.startX, coord.startY, e.data.cellWidth, e.data.cellHeight);
            }
          });

          window.open(canvas.toDataURL(), 'Snapshot', ('width=' + canvas.width + ', height=' + canvas.height + ',menubar=1,resizable=0,scrollbars=0,status=0'));

        };

      },
      taintTest: true,
      allowTaint: true,
      letterRendering: true,
      background: '#00f'
    });
  },
  isFaceDetactorActivated : function() {
    return $('#faceDetectorOutput')[0].style.display === 'inline';
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
      chatroomHash: Users.getLocalUser().roomHash,
      userHash: Users.getLocalUser().id,
      destinationHash: remoteUserId
    });
  }
});
