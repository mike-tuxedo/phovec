App.RoomController = Ember.ObjectController.extend({
  init: function() {
    var loop = setInterval(function() {
      // there are some elements that must be configured during loading chatroom
      if ( typeof FaceDetector !== 'undefined' && $('#faceDetectorOutput')[0] && $('video')[0] ) {
        
        $('#faceDetectorOutput')[0].style.width = $('video').css('width');
        $('#faceDetectorOutput')[0].style.height = '225px';

        FaceDetector.init($('video')[0], $('#faceDetectorOutput')[0]);

        clearInterval(loop);
      }

    }, 1000);
  },
  animation: function(){
      var interval = setInterval(function(){animate($('#show_sidebar'));}, 1250);

      function animate(item){
        if(parseInt(item.css('right')) > -25){
          clearInterval(interval);
        }
        else{
          item.animate({boxShadow: '0 0 300px rgba(68,68,255,0)'}, 1200, function(){item.css('box-shadow','0 0 0px #44f')});
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
<<<<<<< HEAD
    //$('#videoEffectsBar').css('margin-top', '0px');
    $('video')[0].style.display = 'none';
    $('#takeOffClothesButton').show();
=======
>>>>>>> 5446f45dec02b3aa8ef28ee41bfdcf5b7b29810b
    FaceDetector.closing = false;
    if (Users.users && Users.users[0].stream)
      FaceDetector.getStream(Users.users[0].stream, type);
  },
  takeScreenShotFromChatroom: function() {
    
    var controller = this;
    
    $('#videoEffectsBar').css('margin-top', '250px');
    $('#getSnapshotButton').hide();

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
          
          var ctx = canvas.getContext('2d');
          
          e.data.coords.forEach(function(coord, index) {
            controller.drawVideoboxOnCanvas(videos[index], ctx, coord.startX, coord.startY, e.data.cellWidth, e.data.cellHeight);
          });

          $('#getSnapshotButton').show();

          $('#getSnapshotButton').click(function(e) {
            var win = window.open('./assets/js/helpers/snapshot_window.htm', 'Snapshot', ('width=' + canvas.width + ', height=' + canvas.height + ',menubar=1,resizable=0,scrollbars=0,status=0'));
            win.snapshotImage = canvas.toDataURL();
            $('#snapshotButton').show();
            
          });
        };

      },
      taintTest: true,
      allowTaint: true,
      letterRendering: true,
      background: '#00f'
    });

<<<<<<< HEAD
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
  setupVideoEffectBar: function() {
    /*var isShown = false;
    $('#videoEffectsBar').click(function() {
      if (!isShown) {

        $('#videoEffectsBar').css('box-shadow', 'inset 1px 3px 0px 0px #444');
        $('#videoEffectsBar').css('border-bottom-left-radius', '0px');
        $('#videoEffectsBar').css('border-bottom-right-radius', '0px');

        $('#videoEffects').slideDown('fast', function() {
          $('#videoEffects').css('box-shadow', 'inset 1px 0px 0px 0px #444');
        });

        isShown = true;
      } else {
        $('#videoEffectsBar').css('box-shadow', 'inset 1px 1px 5px #444');
        $('#videoEffectsBar').css('border-bottom-left-radius', '15px');
        $('#videoEffectsBar').css('border-bottom-right-radius', '15px');

        $('#videoEffects').css('display', 'none');
        isShown = false;
      }
    });*/
=======
>>>>>>> 5446f45dec02b3aa8ef28ee41bfdcf5b7b29810b
  }
});
