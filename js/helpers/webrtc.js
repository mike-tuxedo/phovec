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

    if (user === "undefined") {
      WebRTC.createLocalUser();
      user = WebRTC.getLocalUser();
    }

    user.stream = event.detail.stream;
  },
  handleSignalingInit: function(event) {
    var data = event.detail;

    /**
     * Modify local user
     */
    var localName = prompt("Nickname:", "Bitte Namen wählen...");
    $('#local_name').text(localName);
    $('#videoboxes #local').attr("id", data.userId);
    console.log("roomHash " + data.roomHash);

    if (user === "undefined") {
      WebRTC.createLocalUser();
      var user = WebRTC.getLocalUser();
      user.name = localName;
      user.roomHash = data.roomHash;
      user.id = data.userId;
    }

    /**
     * Create remote users
     */
    for (var i = 0; i < data.guestIds.length; i++) {
      WebRTC.createRemoteUser(data.roomHash, data.userId, data.guestIds[i].id)
    }
  },
  amountIceMessages: 0,
  createLocalUser: function() {
    var user = {
      name: undefined,
      id: undefined,
      roomHash: undefined,
      peerConnection: undefined,
      stream: undefined,
      type: "local"
    };
    WebRTC.users.push(user);
  },
  createRemoteUser: function(roomHash, userId, remoteUserId) {
    if (navigator.browser[0] === "Chrome") {
      var peerConnection = new PeerConnection({
        'iceServers': [{
          "url": "stun:provserver.televolution.net"
        }, {
          "url": "stun:stun1.voiceeclipse.net"
        }]
      }, {
        mandatory: [{
          'DtlsSrtpKeyAgreement': 'true'
        }]
      }, {
        optional: [{
          RtpDataChannels: true
        }]
      });
    } else if (navigator.browser[0] === "Firefox") {
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
    } else {
      alert("Bitte benutze Chrome oder Firefox!");
      return;
    }

    peerConnection.onicecandidate = function(description) {
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

    /*var channel = peerConnection.createDataChannel('RTCDataChannel');
     channel.onmessage = function(event) {
     console.log(event)

     if (event.data.substr(0, 4) == "\\$cn") {
     user.name = event.data.substr(4);
     $('#' + remoteUserId + ' .name').text(user.name);
     } else if ( typeof event.data == Blob) {
     console.log("BLOB");
     window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function(fs) {
     var file = event.data;
     (function(f) {
     fs.root.getFile(f.name, {
     create: true,
     exclusive: true
     }, function(fileEntry) {
     fileEntry.createWriter(function(fileWriter) {
     fileWriter.write(f);
     }, function() {
     console.log("ERROR WRITER");
     });
     }, function() {
     console.log("ERROR GETFILE");
     });
     })(file);
     }, function() {
     console.log("ERROR REQUESTFILESYSTEM");
     });
     } else {
     var output = new Date().getHours() + ":" + new Date().getMinutes() + " (other) - " + event.data + "&#13;&#10;";
     $('#' + remoteUserId + ' form textarea').append(output);
     }
     };
     channel.onopen = function(event) {
     channel.send("\\$cn" + WebRTC.getLocalUser().name);
     };
     channel.onclose = function(event) {
     console.log('RTCDataChannel closed.');
     };
     channel.onerror = function(event) {
     console.error(event);
     };
     peerConnection.ondatachannel = function(event) {
     console.log('ondatachannel');
     };*/

    var user = {
      name: undefined,
      id: remoteUserId,
      roomHash: roomHash,
      peerConnection: peerConnection,
      stream: undefined,
      channel: undefined/*channel*/,
      type: "remote"
    };

    $('#videoboxes').append("<div class='user' id='" + remoteUserId + "'><span class='name'>Name</span><video autoplay></video><form action='javascript:void(0);'><textarea rows='4' READONLY></textarea><input placeholder='Nachricht...'/></form></div>");
    $('#' + remoteUserId + " form input").keypress(function(e) {
      if (e.which == 13) {
        var input = $(this).val();
        //channel.send(input);

        var output = new Date().getHours() + ":" + new Date().getMinutes() + " (me) - " + input + "&#13;&#10;";
        $('#' + remoteUserId + " textarea").append(output)

        $(this).val("");
        return false;
      }
    });
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
    var data = event.detail;
    var userRemote = WebRTC.getRemoteUser(data.userId);
    var userLocal = WebRTC.getLocalUser();

    console.log(data.sdp);

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
    var user = WebRTC.getRemoteUser(event.detail.userId)
    user.peerConnection.addIceCandidate(new RTCIceCandidate(event.detail.ice));
  },
  handleSignalingParticipant: function(event) {
    var data = event.detail;
    console.log("handleSignalingParticipant");
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