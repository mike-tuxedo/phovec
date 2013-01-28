/**
 * Variables with cross browser compatibility 
 */
PeerConnection = (webkitRTCPeerConnection || mozRTCPeerConnection);
navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

/**
 * Web Real Time Communication 
 */
var WebRTC = {
  configuration: {"iceServers": [{"url": "stun:provserver.televolution.net"}, {"url": "stun:stun1.voiceeclipse.net"}]},
  peerConnection: new PeerConnection(this.configuration),
  init: function(){
    //
    this.peerConnection.onicecandidate = function(message){
      signalingChannel.send({subject:"candidate", ice:description});
    };
    //Gets called when a remote stream arrives
    this.peerConnection.onaddstream = function(remote){
      $('#remote-stream').attr('src', URL.createObjectURL(remote.localStream));
    };
  },
  call: function(){
    this.peerConnection.addStream(LocalMedia.getStream());
    
    //when the callback gotDescription gets called, then there is passed an session description
    this.peerConnection.createOffer(gotDescription);
  },
  takeOff: function(){
    //the own session description has to be compatible to the remote session description
    //so createAnswer needs the remote session description also for creating the local description
    this.peerConnection.createAnswer(peerConnection.remoteDescription, gotDescription);
  },
  //this function is used from createAnswer and createOffer
  //because both have the an session description for local purpose as result
  gotDescription: function(description){
    peerConnection.setLocalDescription(description);
    signalingChannel.send({subject:"sdp", sdp:description});
  }
};

/**
 * Signaling Channel - Connection Setup (SDP/ICE)
 */
var SignalingChannel = {
  webSocket: null,
  init: function(){
    var self = this;
    this.webSocket = new WebSocket('ws://localhost:9001');
    this.webSocket.onopen = function(){
      self.send("");
    };
    this.webSocket.onmessage = function(message){
      message = JSON.parse(message);
      switch(message.subject){
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
      
      console.log("WebSocket: ONMESSAGE");
    };
    this.webSocket.onerror = function(error){
      console.log("WebSocket: ERROR");
    };
    this.webSocket.onclose = function(){
      console.log("WebSocket: CLOSE");
    };
  },
  send: function(message){
    this.webSocket.send(message);
  }
};

/**
 * Local Media Stream 
 */
var LocalMedia = {
  localStream: null,
  getStream: function(){
    return this.localStream;
  },
  onSuccess: function(localStream) {
    this.localStream = localStream;
    $('#local-stream').attr('src', URL.createObjectURL(this.localStream));
    console.log("LocalMedia: SUCCESS");
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
WebRTC.start();
