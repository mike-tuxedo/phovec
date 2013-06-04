function TransferVisualizer(userId) {
  this.userOwnerId = userId;
  this.mainSelector = "#" + userId + " .file-transfer-progress";
  this.currentPercent = 0;
  this.isSender = true;
  this.isCanceled = false;
  this.isPaused = false;

  $(this.mainSelector + ' .overlay').css("width", "100%");
  $(this.mainSelector + ' .buttons .pause').click(function() {
    if ($(this).attr('src') === 'assets/img/pause.png') {
      $(this).attr('src', 'assets/img/play.png');
      transferVisualizer.isPaused = true;
    } else {
      $(this).attr('src', 'assets/img/pause.png');
      transferVisualizer.isPaused = false;
    }
  });
  $(this.mainSelector + ' .buttons .cancel').click(function() {
    transferVisualizer.cancel();
  });
}

TransferVisualizer.prototype.setup = function(options) {
  this.isSender = options.isSender;
  this.isCanceled = false;
  this.isPaused = false;
  this.currentPercent = 0;

  var state = this.isSender === true ? "Senden " : "Empfangen ";
  $(this.mainSelector + ' .info .state').html(state + "<b>0</b> %");

  if (this.isSender === false) {
    $(this.mainSelector + ' .buttons .pause').hide();
  } else {
    $(this.mainSelector + ' .buttons .pause').show();
  }

  $(this.mainSelector + ', ' + this.mainSelector + '  .buttons').show();
};

TransferVisualizer.prototype.update = function(data) {
  var percent = (data.completeSendedDataLength / data.completeDataLength) * 100;
  var roundedPercent = Math.floor(percent);

  if (roundedPercent > this.currentPercent) {
    this.currentPercent = roundedPercent;

    if (this.currentPercent < 100) {
      var state = this.isSender === true ? "Senden " : "Empfangen ";
      $(this.mainSelector + ' .state').html(state + "<b>" + this.currentPercent + "</b> %");
    } else {
      this.complete();
    }

    $(this.mainSelector + ' .overlay').css("width", 100 - this.currentPercent + "%");
  }

  var startTimestamp = data.timestamp;
  var currentTimestamp = new Date().getTime();
  var currentDuration = currentTimestamp - startTimestamp;

  var durationForOnePercent = currentDuration / percent;
  var percentsLeft = 100 - percent;
  var durationLeft = formatTime(durationForOnePercent * percentsLeft, "HH:MM:ss");

  var currentSize = formatBytes(data.size * (percent / 100));
  var completeSize = formatBytes(data.size);

  var info = data.name + " | " + currentSize + " von " + completeSize + " | 1,25 KB/s | Dauer: " + durationLeft;
  $(this.mainSelector + ' .info').text(info)
};

TransferVisualizer.prototype.complete = function() {
  $(this.mainSelector + ' .state').text("Übertragen");
  $(this.mainSelector + ' .buttons').hide();
  $(this.mainSelector + ' .info').text("Übertragung wurde erfolgreich abgeschlossen");
  $(this.mainSelector).fadeOut(2000);
};

TransferVisualizer.prototype.cancel = function() {
  $(this.mainSelector + ' .buttons').hide();
  $(this.mainSelector + ' .state').text("Abgebrochen");
  $(this.mainSelector + ' .overlay').css("width", "0%");
  transferVisualizer.isCanceled = true;

  $(this.mainSelector + ' .info').text("Übertragung wurde abgebrochen");
};
