/* Defining browser name and main version */
navigator.browser = (function() {
  var N = navigator.appName, ua = navigator.userAgent, tem;
  var M = ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
  if (M && ( tem = ua.match(/version\/([\.\d]+)/i)) != null) {
    M[2] = tem[1];
  }
  M = M ? [M[1], M[2]] : [N, navigator.appVersion, '-?'];
  M[1] = M[1].slice(0, 2);
  return M;
})();

/* Defining PeerConnection */
if ( typeof webkitRTCPeerConnection !== "undefined") {
  PeerConnection = webkitRTCPeerConnection;
} else if ( typeof mozRTCPeerConnection !== "undefined") {
  PeerConnection = mozRTCPeerConnection;
}

/* Defining getUserMedia */
if ( typeof navigator.getUserMedia !== "undefined") {
  navigator.getMedia = navigator.getUserMedia;
} else if ( typeof navigator.webkitGetUserMedia !== "undefined") {
  navigator.getMedia = navigator.webkitGetUserMedia;
} else if ( typeof navigator.mozGetUserMedia !== "undefined") {
  navigator.getMedia = navigator.mozGetUserMedia;
} else if ( typeof navigator.msGetUserMedia !== "undefined") {
  navigator.getMedia = navigator.msGetUserMedia;
}

/* Session-Description */
if ( typeof mozRTCSessionDescription !== "undefined") {
  RTCSessionDescription = mozRTCSessionDescription;
}

/* Ice-Messages */
if ( typeof mozRTCIceCandidate !== "undefined") {
  RTCIceCandidate = mozRTCIceCandidate;
}

/* Improved logging overview for development mode */
function trace(file, message, object) {
  var timestamp = formatTime(new Date().getTime(), "HH:MM:ss:SSS");
  console.log(timestamp + "\t" + file + "\t" + message + "\t");
  //console.log("\t\t" + "With data: ", object);
  WebRTCDebugger.update();
}

/* Format timestamp to HH:MM:ss:SSS or HH:MM or HH:MM:ss */
function formatTime(timestamp, format, difference) {
  timestamp = difference ? timestamp - 1*60*60*1000 : timestamp;
  var dateTime = new Date(timestamp);
  var hours = dateTime.getHours();
  var minutes = dateTime.getMinutes();
  var seconds = dateTime.getSeconds();
  var miliseconds = dateTime.getMilliseconds();

  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  if (miliseconds < 10) {
    miliseconds = "000" + miliseconds;
  } else if (miliseconds < 100) {
    miliseconds = "00" + miliseconds;
  } else if (miliseconds < 1000) {
    miliseconds = "0" + miliseconds;
  }

  if (format === "HH:MM") {
    return hours + ":" + minutes;
  } else if (format === "HH:MM:ss:SSS") {
    return hours + ":" + minutes + ":" + seconds + ":" + miliseconds;
  } else if (format === "HH:MM:ss") {
    return hours + ":" + minutes + ":" + seconds;
  }
}

function formatBytes(bytes) {
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

//TURN SERVER TEST
if (navigator.browser[0] === "Chrome" || navigator.browser[0] === "Firefox") {
  RTC_CONFIGURATION = {
    'iceServers': [{
      url: "turn:phovec@nucular-bacon.com",
      credential: "phovec-test"
    }]
  };
}

/*
 RTC_CONFIGURATION = {
 'iceServers': [{
 "url": "stun:stun.sipgate.net"
 }, {
 "url": "stun:stun.internetcalls.com"
 }, {
 "url": "stun:provserver.televolution.net"
 }, {
 "url": "stun:stun1.voiceeclipse.net"
 }]
 };
 */

/* "Media Constraints" for PeerConnection */
if (navigator.browser[0] === "Chrome") {
  RTC_MEDIA_CONSTRAINTS = {
    'optional': [
    /* Commented this because otherwise renegotiation doesn't work
     * {'DtlsSrtpKeyAgreement': true}, */
    {
      'RtpDataChannels': true
    }]
  };
} else if (navigator.browser[0] === "Firefox") {
  RTC_MEDIA_CONSTRAINTS = {
    'optional': [{}]
  };
}

/* "Media Constraints" for createOffer */
if (navigator.browser[0] === "Firefox") {
  MEDIA_CONSTRAINTS_OFFER = {
    "optional": [],
    "mandatory": {
      'OfferToReceiveAudio': true,
      'OfferToReceiveVideo': true,
      'MozDontOfferDataChannel': true
    }
  };
} else if (navigator.browser[0] === "Chrome") {
  MEDIA_CONSTRAINTS_OFFER = {
    "optional": [],
    "mandatory": {
      'OfferToReceiveAudio': true,
      'OfferToReceiveVideo': true
    }
  };
}

/* "Media Constraints" for createAnswer */
if (navigator.browser[0] === "Firefox") {
  MEDIA_CONSTRAINTS_OFFER = {
    "optional": [],
    "mandatory": {
      'OfferToReceiveAudio': true,
      'OfferToReceiveVideo': true,
      'MozDontOfferDataChannel': true
    }
  };
} else if (navigator.browser[0] === "Chrome") {
  MEDIA_CONSTRAINTS_OFFER = {
    "optional": [],
    "mandatory": {
      'OfferToReceiveAudio': true,
      'OfferToReceiveVideo': true
    }
  };
}

/* "Media Constraints" for createAnswer */
MEDIA_CONSTRAINTS_ANSWER = {
  "optional": [],
  "mandatory": {
    'OfferToReceiveAudio': true,
    'OfferToReceiveVideo': true
  }
};

/* Settings for DataChannel */
if (navigator.browser[0] === "Firefox") {
  DATACHANNEL_OPTIONS = {
    protocol: "text/chat",
    preset: true,
    stream: 5
  };
} else if (navigator.browser[0] === "Chrome") {
  DATACHANNEL_OPTIONS = {
    reliable: false
  };
}
