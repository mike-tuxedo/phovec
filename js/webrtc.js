/**
 * Variables with cross browser compatibility
 */
PeerConnection = (webkitRTCPeerConnection || mozRTCPeerConnection);
navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

/**
 * Informations room and remote- and localuser
 */
var UserInformations = {
  roomHash: null,
  userId: null,
  remoteUserId: null
};

//TODO: PeerConnection später für MultiUser mit remoteUserId verbinden

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
    //gets ice messages from stun server
    this.peerConnection.onicecandidate = function(description) {
      console.log("WebRTC: NEW ICE MESSAGE FROM STUN" + " | At second: " + new Date().getSeconds() + " | Number: " + (++WebRTC.amountIceMessages));

      SignalingChannel.send({
        subject: "ice",
        chatroomHash: UserInformations.roomHash,
        userHash: UserInformations.userId,
        destinationHash: UserInformations.remoteUserId,
        ice: description.candidate
      });
    };
    //Gets called when a remote stream arrives
    this.peerConnection.onaddstream = function(remote) {
      console.log("WebRTC: NEW STREAM ARRIVED");
      $('#remote-stream').attr('src', URL.createObjectURL(remote.stream));
    };
    
    this.peerConnection.onconnecting = function(){};
    this.peerConnection.onopen = function(){};
    this.peerConnection.onremovestream = function(){};
  },
  call: function() {
    var loop = setInterval(function() {
      var localStream = LocalMedia.getStream();

      if (localStream == null) {
        console.log("var localStream = " + localStream);
        return;
      } else {
        clearInterval(loop);

        WebRTC.peerConnection.addStream(localStream);
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
    
    console.log("WEBRTC: TakeOff");
    this.peerConnection.createAnswer(this.gotDescription);
  },
  //this function is used from createAnswer and createOffer
  //because both have the an session description for local purpose as result
  gotDescription: function(description) {
    console.log("WebRTC: GOTDESCRIPTION " + description);
    WebRTC.peerConnection.setLocalDescription(description);
    SignalingChannel.send({
      subject: "sdp",
      chatroomHash: UserInformations.roomHash,
      userHash: UserInformations.userId,
      destinationHash: UserInformations.remoteUserId,
      sdp: description
    });
  },
  close: function() {
    this.peerConnection.close();
  }
};

/**
 * Signaling Channel - Connection Setup (SDP/ICE)
 */
var SignalingChannel = {
  webSocket: null,
  init: function() {
    var self = this;
    this.webSocket = new WebSocket('ws://37.200.99.34:9005');
    this.webSocket.onopen = function() {
      console.log("WebSocket: ONOPEN");
      self.send({
        subject: "init",
        url: location.href
      });
    };
    this.webSocket.onmessage = function(message) {
      console.log("WebSocket: ONMESSAGE (from WebSocketServer)");
      console.log(message);
      
      try{
        data = JSON.parse(message.data);
      }catch(e){
        console.log("couldn't parse message from server");
      }
      
      switch(data.subject) {
        case "init":
          if(data.error){
            //TODO: Implemend forwarding to other site
            alert("room full and error happend!");
            return;
          }
          console.log("INIT SERVER -> CLIENT");
          UserInformations.roomHash = data.chatroomHash;
          UserInformations.userId = data.userHash;
          
          //only get the other participant, but only when there is already one
          if(data.guestIds[0]){
            UserInformations.remoteUserId = data.guestIds[0].id; 
          }
          
          var url = "http://37.200.99.34/webrtc.html#" + UserInformations.roomHash;
          $('#url').text("ROOMHASH " + url);
          $('#id').text("OWN USER ID " + UserInformations.userId);
          location.href = url;
          break;
        case "sdp":
          WebRTC.peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
          WebRTC.takeOff();
          break;
        case "ice":
          console.log("PARSED ICE DATA:");
          console.log(data.ice);
          
          if(data.ice){
            WebRTC.peerConnection.addIceCandidate(new RTCIceCandidate(data.ice));
          }
          else{
            console.log("ICE MESSAGE NOT SET");
          }

          break;
        case "participant-join":
          UserInformations.remoteUserId = data.newUserHash;
          console.log("WEBRTC: Participant-Join " + UserInformations.remoteUserId);
          WebRTC.call();
          break;
        case "participant-leave":
          //close everything and reset
          break;
        default:
          console.log()
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
    //TODO: stringify necessary?
    this.webSocket.send(JSON.stringify(message));
  },
  close: function() {
    this.webSocket.onclose = function() {
    };
    this.webSocket.close();
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
    console.log("LocalMedia: ERROR");
    console.log(error);
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

//reset everything when the site gets closed
window.onbeforeunload = function() {
  LocalMedia.stop();
  SignalingChannel.close();
  WebRTC.close();
};

window.onload = function(){
  if(location.href.indexOf('html') == (location.href.length-4)){
    console.log("Window ONLOAD | Forward to URL with #");
    location.href = location.href + "#";
  }
}

WebRTC.init();
SignalingChannel.init();

LocalMedia.start(); 