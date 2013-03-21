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
if ( typeof RTCSessionDescription !== "undefined" ){
  RTCSessionDescription = mozRTCSessionDescription;
}

/* Ice-Messages */
if ( typeof mozRTCIceCandidate !== "undefined" ){
  RTCIceCandidate = mozRTCIceCandidate;
}
