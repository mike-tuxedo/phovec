/**
 * Variables with cross browser compatibility
 */
PeerConnection = (webkitRTCPeerConnection || mozRTCPeerConnection || webkitDeprecatedPeerConnection);
navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

/**
 * Informations room and remote- and localuser
 * emberJS: Room and user model
 * Vorschlag mike, Variablen umbenennen...
 * 		UserInformations zu Room (Wird ein Chatroom-Objekt)
 * 		userId zu mainUserId
 * 		remoteUserId zu remoteUserIds
 * ...dann würde ich noch box.js wegwerfen, da jede box eigentlich auch ein user ist ...doppelt gemoppelt. Die Idee dahinter ist mir klar, find aber das ist overengineering 
 * Also gibts dann nur ein Chatroomobjekt => Room, mit mehreren Userobjekten.
 * Das Chatroommodel muss dafür noch etwas angepasst werden.  ...HokusPokus Schwubsdiwubs, erste integration in emberJS ;)
 */
var UserInformations = {
  roomHash: null,
  userId: null,
  remoteUserId: null
};

//TODO: PeerConnection später für MultiUser mit remoteUserId verbinden

/**
 * Web Real Time Communication
 * ember.JS: Controller or extern js 
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
      console.log("WebRTC: NEW REMOTE STREAM ARRIVED");
      $('#remote-stream').attr('src', URL.createObjectURL(remote.stream));
    };

    //so the getmedia is absolute a stand alone module
    //sendStream adds the local stream for the other remote peer
    window.addEventListener("localmedia:available", this.handleLocalMedia);
    window.addEventListener("signalingchannel:sdp", this.handleSdp);
    window.addEventListener("signalingchannel:ice", this.handleIce);
    window.addEventListener("signalingchannel:participant", this.handleParticipant);

    this.peerConnection.onconnecting = function() {
    };
    this.peerConnection.onopen = function() {
    };
    this.peerConnection.onremovestream = function() {
    };
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

/**
 * Signaling Channel - Connection Setup (SDP/ICE)
 * 
 * Vorschlag mike:
 * nachdem der Signalingvorgang, gestartet wird (werden sollte) sobald der user 
 * den Raum betritt sprich die Seite ansurft, ist das eigentlich eine Funktion die der User dann verwendet
 * um sich mit den anderen bekannt zu machen. Somit gehört das für mich zum User und damit in den UserController.
 * 
 */
var SignalingChannel = {
  webSocket: null,
  init: function() {
    var self = this;
    this.webSocket = new WebSocket('ws://37.200.99.34:49152');
    this.webSocket.onopen = function() {
      console.log("WebSocket: ONOPEN");
      self.send({
        subject: "init",
        url: location.href
      });
    };
    this.webSocket.onmessage = function(message) {
      try {
        data = JSON.parse(message.data);
      } catch(e) {
        console.log("WebSocket: Unparsable message from server");
      }

      switch(data.subject) {
        case "init":
          if (data.error) {
            //TODO: Implemend forwarding to other site
            alert("WebSocket: Room full and error happend!");
            return;
          }
          console.log("WebSocket: INIT SERVER -> CLIENT");
          UserInformations.roomHash = data.chatroomHash;
          UserInformations.userId = data.userHash;

          //only get the other participant, but only when there is already one
          if (data.guestIds[0]) {
            UserInformations.remoteUserId = data.guestIds[0].id;
          }

          var url = "http://37.200.99.34/webrtc.html#" + UserInformations.roomHash;
          $('#url').text("ROOMHASH " + url);
          $('#id').text("OWN USER ID " + UserInformations.userId);
          location.href = url;
          break;
        case "sdp":
          console.log('WebSocket: SDP arrived');
          window.dispatchEvent(new CustomEvent("signalingchannel:sdp", {
            detail: {
              sdp: data.sdp
            }
          }));
          break;
        case "ice":
          if (data.ice) {
            console.log("WebSocket: ICE arrived:");
            
            window.dispatchEvent(new CustomEvent("signalingchannel:ice", {
              detail: {
                ice: data.ice
              }
            }));
          } else {
            console.log("WebSocket: ICE not usable");
          }

          break;
        case "participant-join":
          UserInformations.remoteUserId = data.newUserHash;
          console.log("WebSocket: Participant-Join " + UserInformations.remoteUserId);
          
          window.dispatchEvent(new CustomEvent("signalingchannel:participant", {
            detail: {
              message: "join"
            }
          }));
          break;
        case "participant-leave":
          //close and reset everything
          break;
        default:
          console.log("WebSocket: Unknown subject in message!");
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
 * emberJS: Part of chatroom-controller OR single media controller (maybe the best way)
 * 
 * Vorschlag mike:
 * der lokale stream repräsentiert eigentlich den user selbst, also auch ein userfunktion im usercontroller.
 * wäre es nicht LocalMedia sonder nur Media und somit für lokal und remotestreams zuständig, wäre es dem Room zugehörig.
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
    LocalMedia.setStream(localStream);
    window.dispatchEvent(new CustomEvent("localmedia:available"));
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
 
//forward user with no hash-link to the site with a #
window.onload = function() {
  if (location.href.indexOf('html') == (location.href.length - 4)) {
    console.log("Window ONLOAD | Forward to URL with #");
    location.href = location.href + "#";
  }
}

WebRTC.init();
SignalingChannel.init();

LocalMedia.start();