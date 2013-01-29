/**
 * Variables with cross browser compatibility
 */
PeerConnection = (webkitRTCPeerConnection || mozRTCPeerConnection);
navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

/**
 * Web Real Time Communication
 */
var WebRTC = {
  configuration: {
    "iceServers": [{
      "url": "stun:provserver.televolution.net"
    }, {
      "url": "stun:stun1.voiceeclipse.net"
    }]
  },
  peerConnection: new PeerConnection(this.configuration),
  amountIceMessages: 0,
  init: function() {
    //gets ice messages from stun server?
    this.peerConnection.onicecandidate = function(message) {
      console.log("WebRTC: NEW ICE MESSAGE FROM STUN" + " | At second: " + new Date().getSeconds() + " | Number: " + ++WebRTC.amountIceMessages);

      SignalingChannel.send({
        subject: "candidate",
        ice: message
      });
    };
    //Gets called when a remote stream arrives
    this.peerConnection.onaddstream = function(remote) {
      console.log("WebRTC: NEW STREAM ARRIVED");
      $('#remote-stream').attr('src', URL.createObjectURL(remote.stream));
    };
  },
  call: function() {
    var loop = setInterval(function() {
      var localStream = LocalMedia.getStream();

      if (localStream == null) {
        console.log("var localStream = " + localStream);
        return;
      } else {
        clearInterval(loop);

        WebRTC.peerConnection.addStream(LocalMedia.getStream());
        console.log("WebRTC: CREATEOFFER");
        //when the callback gotDescription gets called, then there is passed an session description
        WebRTC.peerConnection.createOffer(WebRTC.gotDescription);
      }
    }, 1500);
  },
  takeOff: function() {
    console.log("WebRTC: TAKEOFF");
    //the own session description has to be compatible to the remote session description
    //so createAnswer needs the remote session description also for creating the local description
    this.peerConnection.createAnswer(peerConnection.remoteDescription, gotDescription);

  },
  //this function is used from createAnswer and createOffer
  //because both have the an session description for local purpose as result
  gotDescription: function(description) {
    console.log("WebRTC: GOTDESCRIPTION " + description);
    WebRTC.peerConnection.setLocalDescription(description);
    SignalingChannel.send({
      subject: "sdp",
      sdp: description
    });
  }
};

/**
 * Signaling Channel - Connection Setup (SDP/ICE)
 */
var SignalingChannel = {
  webSocket: null,
  init: function() {
    var self = this;
    this.webSocket = new WebSocket('ws://localhost:9001');
    this.webSocket.onopen = function() {
      console.log("WebSocket: ONOPEN");
      self.send("ONOPEN");
    };
    this.webSocket.onmessage = function(message) {
      console.log("WebSocket: ONMESSAGE (from WebSocketServer)");
      message = JSON.parse(message);
      switch(message.subject) {
        case "sdp":
          WebRTC.peerConnection.setRemoteDescription(new RTCSessionDescription(message.sdp));
          WebRTC.takeOff();
          break;
        case "candidate":
          WebRTC.peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
          break;
        default:
          break;
      };
    };
    this.webSocket.onerror = function(error) {
      console.log("WebSocket: ERROR");
    };
    this.webSocket.onclose = function() {
      console.log("WebSocket: CLOSE");
    };
  },
  send: function(message) {
    console.log("WebSocket: SEND " + message);
    this.webSocket.send(message);
  }
};

/**
 * Local Media Stream
 */
var LocalMedia = {
  localStream: null,
  setStream: function(stream) {
    this.localStream = stream;
  },
  getStream: function() {
    return this.localStream;
  },
  onSuccess: function(localStream) {
    console.log("LocalMedia: SUCCESS");
    LocalMedia.setStream(localStream);
    $('#local-stream').attr('src', URL.createObjectURL(localStream));
  },
  onError: function(error) {
    console.log("LocalMedia: ERROR " + error);
  },
  start: function() {
    //request audio and video from your own hardware
    navigator.getMedia({
      audio: true,
      video: true
    }, this.onSuccess, this.onError);
  },
  stop: function() {
    //get(0) gets the dom element fromt he jquery selector
    $('#local-stream').get(0).pause();
    $('#local-stream').attr('src', null);
  }
};

WebRTC.init();
SignalingChannel.init();

LocalMedia.start();
WebRTC.call();
