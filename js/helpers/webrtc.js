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
      console.log("WebRTC: NEW REMOTE STREAM ARRIVED");
      $('#remote-stream').attr('src', URL.createObjectURL(remote.stream));
    };

    //so the getmedia is absolute a stand alone module
    //sendStream adds the local stream for the other remote peer
    window.addEventListener("localmedia:available", this.handleLocalMedia);
    window.addEventListener("signalingchannel:sdp", this.handleSdp);
    window.addEventListener("signalingchannel:ice", this.handleIce);
    window.addEventListener("signalingchannel:participant", this.handleParticipant);

    /*this.peerConnection.onconnecting = function() {
     };
     this.peerConnection.onopen = function() {
     };
     this.peerConnection.onremovestream = function() {
     };*/
  },
  handleLocalMedia: function(event) {
    //... currently row 72 and 92 checks every second if there is already a stream and attach it
    //TODO: Check why there must already be a stream on peerConnection before etablish the connection
  },
  handleSdp: function(event) {
    WebRTC.peerConnection.setRemoteDescription(new RTCSessionDescription(event.detail.sdp));
    if (!WebRTC.peerConnection.localDescription) {

      var loop = setInterval(function() {
        var localStream = LocalMedia.getStream();

        if (localStream == null) {
          return;
        } else {
          clearInterval(loop);
          WebRTC.peerConnection.addStream(localStream);
          WebRTC.peerConnection.createAnswer(WebRTC.gotDescription);
        }
      }, 1000);

    }
  },
  handleIce: function(event) {
    WebRTC.peerConnection.addIceCandidate(new RTCIceCandidate(event.detail.ice));
  },
  handleParticipant: function(event) {
    switch (event.detail.message) {
      case "join":
        var loop = setInterval(function() {
          var localStream = LocalMedia.getStream();

          if (localStream == null) {
            return;
          } else {
            clearInterval(loop);
            WebRTC.peerConnection.addStream(localStream);
            WebRTC.peerConnection.createOffer(WebRTC.gotDescription);
          }
        }, 1000);
        break;
      default:
        break;
    }
  },
  sendStream: function() {
    console.log("WebRTC: Stream gets added");
    WebRTC.peerConnection.addStream(LocalMedia.getStream());
  },
  connectToPeer: function() {
    if (WebRTC.peerConnection.remoteDescription && !WebRTC.peerConnection.localDescription) {
      this.peerConnection.createAnswer(this.gotDescription);
    } else if (!WebRTC.peerConnection.remoteDescription && !WebRTC.peerConnection.localDescription) {
      this.peerConnection.createOffer(this.gotDescription);
    } else {
      //WebRTC: NO OFFER or ANSWER needed because remote and local description are set
      return;
    }
  },
  //this function is used from createAnswer and createOffer
  //because both have the an session description for local purpose as result
  gotDescription: function(description) {
    console.log("WebRTC: GOT DESCRIPTION");
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
