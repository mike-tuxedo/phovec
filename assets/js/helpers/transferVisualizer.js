var transferVisualizer = {
  currentPercent: 0,
  isSender: true,
  isCanceled: false,
  isPaused: false,
  init: function(options) {
    this.isSender = options.isSender;
    this.isCanceled = false;
    this.isPaused = false;
    this.currentPercent = 0;

    var state = this.isSender === true ? "Senden " : "Empfangen ";
    $('.file-transfer-progress .info .state').html(state + "<b>0</b> %");

    if (this.isSender === false) {
      $('.file-transfer-progress .buttons .pause').hide();
    } else {
      $('.file-transfer-progress .buttons .pause').show();
    }

    $('.file-transfer-progress, .file-transfer-progress .buttons').show();
    $('.file-transfer-progress .overlay').css("width", "100%");

    $('.file-transfer-progress .buttons .pause').click(function() {
      if ($(this).attr('src') === 'assets/img/pause.png') {
        $(this).attr('src', 'assets/img/play.png');
        transferVisualizer.isPaused = true;
      } else {
        $(this).attr('src', 'assets/img/pause.png');
        transferVisualizer.isPaused = false;
      }
    });
    $('.file-transfer-progress .buttons .cancel').click(function() {
      transferVisualizer.cancel();
    });
  },
  update: function(data) {
    var percent = (data.completeSendedDataLength / data.completeDataLength) * 100;
    var roundedPercent = Math.floor(percent);

    if (roundedPercent > this.currentPercent) {
      this.currentPercent = roundedPercent;

      if (this.currentPercent < 100) {
        var state = this.isSender === true ? "Senden " : "Empfangen ";
        $('.file-transfer-progress .state').html(state + "<b>" + this.currentPercent + "</b> %");
      } else {
        this.complete();
      }

      $('.file-transfer-progress .overlay').css("width", 100 - this.currentPercent + "%");
    }

    var startTimestamp = data.timestamp;
    var currentTimestamp = new Date().getTime();
    var currentDuration = currentTimestamp - startTimestamp;

    var durationForOnePercent = currentDuration / percent;
    var percentsLeft = 100 - percent;
    var durationLeft = formatTime(durationForOnePercent * percentsLeft, "HH:MM:ss");

    var currentSize = formatBytes(data.size * (percent/100));
    var completeSize = formatBytes(data.size);

    var info = data.name + " | " + currentSize + " von " + completeSize + " | 1,25 KB/s | Dauer: " + durationLeft;
    $('.info').text(info)
  },
  complete: function() {
    $('.file-transfer-progress .state').text("Übertragen");
    $('.file-transfer-progress .buttons').hide();
    $('.info').text("Übertragung wurde erfolgreich abgeschlossen");
    $('.file-transfer-progress').fadeOut(2000);
  },
  cancel: function() {
    $('.file-transfer-progress .buttons').hide();
    $('.file-transfer-progress .state').text("Abgebrochen");
    $('.file-transfer-progress .overlay').css("width", "0%");
    transferVisualizer.isCanceled = true;

    $('.info').text("Übertragung wurde abgebrochen");
  }
};
