function TransferVisualizer(userId) {
  this.userOwnerId = userId.trim();
  this.mainSelector = "#" + userId + " .file-transfer-progress";
  this.currentPercent = 0;
  this.isSender = true;
  this.isCanceled = false;
  this.isPaused = false;

  var that = this;
  $(this.mainSelector + ' .buttons .pause').click(function(event) {
    var fileDroppedElements = $("#" + that.userOwnerId + " .fileStatus");
    if ($(this).attr('src') === 'assets/img/pause.png') {
      $(this).attr('src', 'assets/img/play.png');
      that.isPaused = true;
      fileDroppedElements[fileDroppedElements.length - 1].innerHTML = "Pausiert";
    } else {
      $(this).attr('src', 'assets/img/pause.png');
      that.isPaused = false;
      fileDroppedElements[fileDroppedElements.length - 1].innerHTML = "Übertragen...";
    }
  });
  $(this.mainSelector + ' .buttons .cancel').click(function() {
    that.cancel();
  });
}

TransferVisualizer.prototype.setup = function(options) {
  this.isSender = options.isSender;
  this.isCanceled = false;
  this.isPaused = false;
  this.currentPercent = 0;

  var state = this.isSender === true ? "Senden " : "Empfangen ";
  $(this.mainSelector + ' .info .state').html(state + "<b>0</b> %");
  $(this.mainSelector + ' .overlay').css("width", "100%");

  if (this.isSender === false) {
    $(this.mainSelector + ' .buttons .pause').hide();
  } else {
    $(this.mainSelector + ' .buttons .pause').show();
  }

  $(this.mainSelector + ', ' + this.mainSelector + '  .buttons').show();
};

TransferVisualizer.prototype.update = function(data) {
  if (this.isCanceled === true) {
    return;
  }

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
  var durationLeft = formatTime(durationForOnePercent * percentsLeft, "HH:MM:ss", true);

  var currentSize = formatBytes(data.size * (percent / 100));
  var completeSize = formatBytes(data.size);

  var info = data.name + " | " + currentSize + " von " + completeSize + " | 1,25 KB/s | Dauer: " + durationLeft;
  $(this.mainSelector + ' .info').text(info);

  var fileDroppedElements = $("#" + this.userOwnerId + " .fileStatus");
  fileDroppedElements[fileDroppedElements.length - 1].innerHTML = "Übertragung...";
};

TransferVisualizer.prototype.complete = function() {
  $(this.mainSelector + ' .state').text("Übertragen");
  $(this.mainSelector + ' .buttons').hide();
  $(this.mainSelector + ' .info').text("Übertragung wurde erfolgreich abgeschlossen");
  this.fadeOut();

  if (this.isSender) {
    var fileDroppedElements = $("#" + this.userOwnerId + " .fileStatus");
    fileDroppedElements[fileDroppedElements.length - 1].innerHTML = "Abgeschlossen";
  }
};

TransferVisualizer.prototype.cancel = function() {
  $(this.mainSelector + ' .buttons').hide();
  $(this.mainSelector + ' .state').text("Abgebrochen");
  $(this.mainSelector + ' .overlay').css("width", "0%");
  this.isCanceled = true;
  $(this.mainSelector + ' .info').text("Übertragung wurde abgebrochen");
  this.fadeOut();

  var fileDroppedElements = $("#" + this.userOwnerId + " .fileStatus");
  fileDroppedElements[fileDroppedElements.length - 1].innerHTML = "Abgebrochen";
};

TransferVisualizer.prototype.fadeOut = function() {
  var that = this;

  setTimeout(function() {
    $(that.mainSelector).fadeOut(1500);
  }, 1500);
};
