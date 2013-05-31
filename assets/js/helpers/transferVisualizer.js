var transferVisualizer = {
  currentPercent: 0,
  isSender: true,
  isCanceled: false,
  isPaused: false,
  update: function(filesize, transferedAmount) {
    var percent = Math.floor((transferedAmount / filesize) * 100);
    console.log(percent);
    if (percent > this.currentPercent) {
      this.currentPercent = percent;

      if (this.currentPercent < 100) {
        var state = this.isSender === true ? "Senden " : "Empfangen ";
        $('.file-transfer-progress .info .state').html(state + "<b>" + this.currentPercent + "</b> %");
      } else {
        this.complete();
      }

      $('.file-transfer-progress .overlay').css("width", 100 - this.currentPercent + "%");
    }
  },
  init: function(options) {
    this.isSender = options.isSender;
    this.isCanceled = false;
    this.isPaused = false;
    this.currentPercent = 0;

    if (this.isSender === false) {
      $('.file-transfer-progress .info .buttons').hide();
    }

    $('.file-transfer-progress').show();

    $('.file-transfer-progress .info .buttons .pause').click(function() {
      if ($(this).attr('src') === 'assets/img/pause.png') {
        $(this).attr('src', 'assets/img/play.png');
        transferVisualizer.isPaused = true;
      } else {
        $(this).attr('src', 'assets/img/pause.png');
        transferVisualizer.isPaused = false;
      }
    });
    $('.file-transfer-progress .info .buttons .cancel').click(function() {
      $('.file-transfer-progress').hide();
      transferVisualizer.isCanceled = true;
    });
  },
  complete: function() {
    $('.file-transfer-progress .info .state').text("Übertragen");
    $('.file-transfer-progress .info .buttons').hide();
  }
};

/**
 *        <div class="info">
 <div class="state"></div>
 <div class="buttons">
 <div class="pause"></div>
 <div class="cancel"></div>
 </div>
 </div>
 */