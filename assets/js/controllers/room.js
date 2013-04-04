App.RoomController = Ember.ObjectController.extend({
  init: function() {

    var controller = this;

    var loop = setInterval(function() {
      // there are some elements that must be configured during loading chatroom
      if ( typeof FaceDetector !== undefined && $('#faceDetectorOutput')[0] && $('video')[0] && $('#videoEffectsBar')) {

        $('#faceDetectorOutput')[0].style.width = $('video').css('width');
        $('#faceDetectorOutput')[0].style.height = '225px';
        
        FaceDetector.init($('video')[0], $('#faceDetectorOutput')[0]);

        controller.setupVideoEffectBar();

        clearInterval(loop);
      }

    }, 500);

    console.log('start animation');
    /* starting animated plus */  
    //setTimeout(function(){setInterval(function(){animate($('#plus_button'), 0.3)}, 500)}, 0);
    //setTimeout(function(){setInterval(function(){animate($('#plus_button'), 1)}, 500)}, 500);

    animate($('#plus_button'), 0);
    
    function animate(item, blur){
      item.animate({boxShadow: '0 0 30px #44f'});
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
    $('video').css('display', 'inline');
    $('#faceDetectorOutput')[0].style.display = 'none';
    $('#takeOffClothesButton').hide();
    $('#videoEffectsBar').css('margin-top', '250px');
    FaceDetector.closing = true;
  },
  putUserStreamOnDetector: function(type) {
    $('#videoEffectsBar').css('margin-top', '0px');
    $('#takeOffClothesButton').show();
    FaceDetector.closing = false;
    if (Users.users && Users.users[0].stream)
      FaceDetector.getStream(Users.users[0].stream, type);
  },
  takeScreenShotFromChatroom: function() {

    $('#videoEffectsBar').css('margin-top', '250px');
    $('#getSnapshotButton').hide();

    html2canvas([document.getElementById('videoboxes')], {
      onrendered: function(canvas) {

        $('#progressSnapshotbar').show();

        var videoTags = $('video');

        var snapshotWorker = new Worker('assets/js/helpers/snapshot_worker.js');

        snapshotWorker.postMessage({
          image_data: (canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)),
          color: '#999999',
          videoNum: (videoTags.length)
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

          e.data.coords.forEach(function(coord, index) {

            var ctx = canvas.getContext('2d');

            for (var v = 0; v < videoTags.length; v++) {

              ctx.drawImage(videoTags[v], 0, 0, videoTags[v].videoWidth, videoTags[v].videoHeight, // s_x, s_y, s_width, s_height
              coord.startX, coord.startY, // d_x, d_y
              e.data.cellWidth, // d_width, number because of '#999999'-areas
              e.data.cellHeight // d_height, number because of '#999999'-areas
              );
            }

          });

          $('#getSnapshotButton').show();

          $('#getSnapshotButton').click(function(e) {
            var win = window.open(canvas.toDataURL('image/png'), 'Snapshot', ('width=' + canvas.width + ', height=' + canvas.height + ',menubar=0,resizable=0,scrollbars=0,status=0'));
            $('#snapshotButton').show();
          });
        };

      },
      taintTest: true,
      allowTaint: true,
      letterRendering: true,
      background: '#00f'
    });

  },
  setupVideoEffectBar: function() {
    var isShown = false;
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
    });
  }
});
