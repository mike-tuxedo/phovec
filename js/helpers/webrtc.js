var WebRTC = {
  init: function() {
    window.addEventListener("localmedia:available", this.handleLocalMedia);
    window.addEventListener("signalingchannel:init", this.handleSignalingInit);
    window.addEventListener("signalingchannel:sdp", this.handleSignalingSdp);
    window.addEventListener("signalingchannel:ice", this.handleSignalingIce);
    window.addEventListener("signalingchannel:participant", this.handleSignalingParticipant);
  },
  users: [],
  handleLocalMedia: function(event) {
    var user = WebRTC.getLocalUser();
    user.stream = event.detail.stream;
  },
  handleSignalingInit: function(event) {
    var data = event.detail;

    /**
     * Create local user
     */
    var user = {
      name: undefined,
      id: undefined,
      roomHash: undefined,
      peerConnection: undefined,
      stream: undefined,
      type: "local"
    };
    WebRTC.users.push(user);

    /**
     * Change local user
     */
    var user = WebRTC.getLocalUser();
    user.id = data.userId;
    user.roomHash = data.roomHash;
    $('#videoboxes #local').attr("id", data.userId);
    console.log("roomHash " + data.roomHash);

    /**
     * Create remote users
     */
    for (var i = 0; i < data.guestIds.length; i++) {
      WebRTC.createRemoteUser(data.roomHash, data.userId, data.guestIds[i].id)
    }
  },
  amountIceMessages: 0,
  createRemoteUser: function(roomHash, userId, remoteUserId) {

    var peerConnection = new PeerConnection({
      "iceServers": [{
        "url": "stun:provserver.televolution.net"
      }, {
        "url": "stun:stun1.voiceeclipse.net"
      }]
    }, {
      optional: [{
        RtpDataChannels: true
      }]
    });

    peerConnection.onicecandidate = function(description) {
      console.log("PEERCONNECTION: NEW ICE MESSAGE FROM STUN" + " | At second: " + new Date().getSeconds() + " | Number: " + (++WebRTC.amountIceMessages));

      SignalingChannel.send({
        subject: "ice",
        chatroomHash: roomHash,
        userHash: userId,
        destinationHash: remoteUserId,
        ice: description.candidate
      });
    };

    peerConnection.onaddstream = function(remote) {
      console.log(remote);
      console.log("WebRTC: NEW REMOTE STREAM ARRIVED");
      $('#' + remoteUserId + ' video').attr('src', URL.createObjectURL(remote.stream));
    };

    /*var channel = peerConnection.createDataChannel('RTCDataChannel', {
     reliable: false
     });
     channel.onmessage = function(event) {
     console.log(event.data);
     };
     channel.onopen = function(event) {
     channel.send('RTCDataChannel opened.');
     };
     channel.onclose = function(event) {
     console.log('RTCDataChannel closed.');
     };
     channel.onerror = function(event) {
     console.error(event);
     };
     peerConnection.ondatachannel = function() {
     console.log('peerConnection.ondatachannel event fired.');
     };*/

    var user = {
      name: undefined,
      id: remoteUserId,
      roomHash: roomHash,
      peerConnection: peerConnection,
      stream: undefined,
      type: "remote"
    };

    $('#videoboxes').append("<div class='user' id='" + remoteUserId + "'><label>Name</label><video autoplay></video></div>");
    WebRTC.users.push(user);
  },
  getRemoteUser: function(id) {
    for (var i = 0; i < WebRTC.users.length; i++) {
      if (WebRTC.users[i].id === id && WebRTC.users[i].type === "remote") {
        return WebRTC.users[i];
      }
    }
  },
  removeRemoteUser: function(id) {
    for (var i = 0; i < WebRTC.users.length; i++) {
      if (WebRTC.users[i].id === id) {
        var user = WebRTC.users[i];
        user.peerConnection.close();
        $('#' + user.id).remove();
        user = null;

        WebRTC.users.splice(i, 1);
      }
    }
  },
  getLocalUser: function(id) {
    for (var i = 0; i < WebRTC.users.length; i++) {
      if (WebRTC.users[i].type === "local") {
        return WebRTC.users[i];
      }
    }
  },
  handleSignalingSdp: function(event) {

    console.log("HANDLE REMOTE SDP");
    var data = event.detail;
    var userRemote = WebRTC.getRemoteUser(data.userId);
    var userLocal = WebRTC.getLocalUser();

    userRemote.peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
    if (!userRemote.peerConnection.localDescription) {
      var loop = setInterval(function() {
        if (userLocal.stream === undefined) {
          return;
        } else {
          clearInterval(loop);

          userRemote.peerConnection.addStream(userLocal.stream);
          userRemote.peerConnection.createAnswer(function(description) {
            userRemote.peerConnection.setLocalDescription(description);
            SignalingChannel.send({
              subject: "sdp",
              chatroomHash: userLocal.roomHash,
              userHash: userLocal.id,
              destinationHash: userRemote.id,
              sdp: description
            });
          });
        }
      }, 1000);
    }
  },
  handleSignalingIce: function(event) {
    console.log("HANDLE REMOTE ICE");
    var user = WebRTC.getRemoteUser(event.detail.userId)
    user.peerConnection.addIceCandidate(new RTCIceCandidate(event.detail.ice));
  },
  handleSignalingParticipant: function(event) {
    var data = event.detail;
    switch (data.message) {
      case "join":
        var userLocal = WebRTC.getLocalUser();

        WebRTC.createRemoteUser(data.roomHash, userLocal.id, data.userId);
        var userRemote = WebRTC.getRemoteUser(data.userId);

        var loop = setInterval(function() {
          if (userLocal.stream === undefined) {
            return;
          } else {
            clearInterval(loop);
            userRemote.peerConnection.addStream(userLocal.stream);
            userRemote.peerConnection.createOffer(function(description) {
              userRemote.peerConnection.setLocalDescription(description);
              SignalingChannel.send({
                subject: "sdp",
                chatroomHash: userLocal.roomHash,
                userHash: userLocal.id,
                destinationHash: userRemote.id,
                sdp: description
              });
            });
          }
        }, 1000);
        break;
      case "leave":
        WebRTC.removeRemoteUser(data.userId);
        break;
      default:
        console.log("Undefined participant message");
        break;
    }
  },
  hangup: function() {
    for (var i = 0; i < WebRTC.users.length; i++) {
      if (WebRTC.users[i].type === "remote") {
        WebRTC.users[i].peerConnection.close();
      }
    }

    var userLocal = WebRTC.getLocalUser();
    if (userLocal === undefined) {
      return;
    }

    if (userLocal.stream !== undefined) {
      userLocal.stream.stop();
    }

    WebRTC.users = [];
  }
};

WebRTC.init();
