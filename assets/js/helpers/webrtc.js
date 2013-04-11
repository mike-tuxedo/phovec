var WebRTC = {
  initialized: false,
  init: function() {
    if (this.initialized) {
      return true;
    }

    window.addEventListener("localmedia:available", this.handleLocalMedia);
    window.addEventListener("signalingchannel:init", this.handleSignalingInit);
    window.addEventListener("signalingchannel:sdp", this.handleSignalingSdp);
    window.addEventListener("signalingchannel:ice", this.handleSignalingIce);
    window.addEventListener("signalingchannel:participant", this.handleSignalingParticipant);

    Users.createLocalUser();
    this.initialized = true;
  },
  createPeerConnection: function(roomHash, userId, remoteUserId) {
    /**
     * Create PeerConnection
     */
    var peerConnection = new PeerConnection(RTC_CONFIGURATION, RTC_MEDIA_CONSTRAINTS);

    peerConnection.onicecandidate = function(description) {
      trace("webrtc", "Got Ice from STUN", description);

      SignalingChannel.send({
        subject: "ice",
        chatroomHash: roomHash,
        userHash: userId,
        destinationHash: remoteUserId,
        ice: description.candidate
      });
    };
    peerConnection.onaddstream = function(event) {
      trace("webrtc", "Remote Stream arrived", event);

      $('#' + remoteUserId + ' video').attr('src', URL.createObjectURL(event.stream));
      if (navigator.browser[0] === "Firefox") {
        $('#' + remoteUserId + ' video').get(0).play();
      }
      trace("webrtc", "Remote Stream arrived", event);
      
    };
    peerConnection.onremovestream = function(event) {
      trace("webrtc", "Remote Stream removed", event);
      $('#' + remoteUserId + ' video').attr('src', '');
    };
    peerConnection.onnegotiationneeded = function() {
      WebRTC.onNegotationNeeded(remoteUserId);
    };
    peerConnection.onsignalingstatechange = function() {
      WebRTCDebugger.update();
    };
    peerConnection.oniceconnectionstatechange = function() {
      WebRTCDebugger.update();
    };

    /**
     * Create DataChannel
     */
    /*var dataChannel = peerConnection.createDataChannel('RTCDataChannel', DATACHANNEL_OPTIONS);
     dataChannel.onmessage = function(event) {
     if (event.data.substr(0, 4) == "\\$cn") {
     user.name = event.data.substr(4);
     $('#' + remoteUserId + ' .name').text(user.name);
     } else {
     var name = $('#' + remoteUserId + ' .name').text();
     var output = new Date().getHours() + ":" + new Date().getMinutes() + " (" + name + ") - " + event.data + "&#13;&#10;";
     $('#' + remoteUserId + ' form textarea').append(output);
     }
     };
     dataChannel.onopen = function(event) {
     trace("webrtc", "DataChannel onopen", event);
     dataChannel.send("\\$cn" + WebRTC.getLocalUser().name);
     };
     dataChannel.onclose = function(event) {
     trace("webrtc", "DataChannel onclose", event);
     };
     dataChannel.onerror = function(event) {
     trace("webrtc", "DataChannel onerror", event);
     };
     peerConnection.ondatachannel = function(event) {
     trace("webrtc", "DataChannel ondatachannel", event);
     };*/

    Users.createRemoteUser(roomHash, remoteUserId, peerConnection, undefined);
  },
  modifyDescription: function(description) {
    var sdp = description.sdp;
    var cryptoLine = "a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:BAADBAADBAADBAADBAADBAADBAADBAADBAADBAAD";
    sdp = sdp.replace(/c=/g, cryptoLine + "\nc=");
    description.sdp = sdp;
    return description;
  },
  onNegotationNeeded: function(remoteUserId) {
    var userRemote = Users.getRemoteUser(remoteUserId);
    var userLocal = Users.getLocalUser();

    if (userRemote.peerConnection.remoteDescription !== null) {
      if (userRemote.peerConnection.remoteDescription.type === "offer") {
        trace("webrtc", "Call createAnswer", "-");
        userRemote.peerConnection.createAnswer(function(description) {
          trace("webrtc", "CreateAnswer Callback called", description);
          trace("webrtc", "Set local description", description);
          userRemote.peerConnection.setLocalDescription(description, function() {
            trace("webrtc", "Success set local description", event);
          }, function(event) {
            trace("webrtc", "Failure set local description", event);
          });

          SignalingChannel.send({
            subject: "sdp",
            chatroomHash: userLocal.roomHash,
            userHash: userLocal.id,
            destinationHash: userRemote.id,
            sdp: description
          });
        }, function() {
          trace("webrtc", "Failure at calling createAnswer", "-");
        }, MEDIA_CONSTRAINTS_ANSWER);
        return;
      }
    } else {
      userRemote.peerConnection.createOffer(function(description) {
        trace("webrtc", "createOffer Callback called", description);

        trace("webrtc", "Set local description", description);
        userRemote.peerConnection.setLocalDescription(description, function() {
          trace("webrtc", "Success set local", description);

          if (navigator.browser[0] === "Firefox") {
            description = WebRTC.modifyDescription(description);
          }

          SignalingChannel.send({
            subject: "sdp",
            chatroomHash: userLocal.roomHash,
            userHash: userLocal.id,
            destinationHash: userRemote.id,
            sdp: description
          });
        }, function() {
          trace("webrtc", "Failure set local", description);
        });
      }, function() {
        trace("webrtc", "Failure calling createOffer", "-");
      }, MEDIA_CONSTRAINTS_OFFER);
    }
  },
  handleLocalMedia: function(event) {
    trace("webrtc", "Local Media Available", event);

    var user = Users.getLocalUser();
    user.stream = event.detail.stream;
  },
  handleSignalingInit: function(event) {
    trace("webrtc", "Signaling Init", event);
    var data = event.detail;

    /**
     * If there is an error handle it
     */
    if (data.error !== undefined) {
      switch(data.error) {
        case "room:full":
          App.handleURL('/full');
          App.Router.router.replaceURL('/full');
          break;
        case "room:unknown":
          App.handleURL('/unknown');
          App.Router.router.replaceURL('/unknown');
          break;
        default:
          trace("webrtc", "Got unknown error!", event);
          break;
      }
      return;
    }

    /* set url according to the room-hash */
    App.handleURL('room/' + data.roomHash);
    App.Router.router.replaceURL('/room/' + data.roomHash);

    /**
     * Create remote users
     * Have to be before the modification of the local user,
     * because there could be action with the remote user now
     */
    for (var i = 0; i < data.guestIds.length; i++) {
      WebRTC.createPeerConnection(data.roomHash, data.userId, data.guestIds[i].id)
    }

    /**
     * Modify local user
     */
    var user = Users.getLocalUser();
    user.roomHash = data.roomHash;
    user.id = data.userId;

    // Use setTimeout to get an asynchronous answer and don't stop the script
    setTimeout(function(user) {
      var user = Users.getLocalUser();
      var localName = "Test";
      //prompt("Nickname:", "Bitte Namen wählen...");
      user.name = localName;

      $('#local_name').text(localName);
      $('#videoboxes #local').attr("id", data.userId);
    }, 500);
  },
  handleSignalingSdp: function(event) {
    trace("webrtc", "Handle SDP", event);

    var data = event.detail;
    var userRemote = Users.getRemoteUser(data.userId);

    trace("webrtc", "Set remote Description", event);
    userRemote.peerConnection.setRemoteDescription(new RTCSessionDescription({
      type: data.sdp.type,
      sdp: data.sdp.sdp
    }), function() {
      trace("webrtc", "Success set remote description", event);

      if (userRemote.peerConnection.remoteDescription.type === "offer") {
        var userLocal = Users.getLocalUser();
        var loop = setInterval(function() {
          if (userLocal.stream === undefined) {
            return;
          } else {
            clearInterval(loop);
            userRemote.peerConnection.addStream(userLocal.stream);
            trace("webrtc", "Added local stream to peerConnection", userLocal.stream);

            //Bugfix because addStream doesn't fire onnegotiationneeded in firefox nightly 23.01a
            if (navigator.browser[0] === "Firefox") {
              WebRTC.onNegotationNeeded(data.userId);
            }
          }
        }, 500);
      }
    }, function(event) {
      trace("webrtc", "Failure set remote description", event);
    });
  },
  handleSignalingIce: function(event) {
    trace("webrtc", "Handle Ice Candidate", event);
    var user = Users.getRemoteUser(event.detail.userId);

    user.peerConnection.addIceCandidate(new RTCIceCandidate({
      sdpMid: event.detail.ice.sdpMid,
      sdpMLineIndex: event.detail.ice.spdMLineIndex,
      candidate: event.detail.ice.candidate
    }));
  },
  handleSignalingParticipant: function(event) {
    trace("webrtc", "Handle Participant", event);

    var data = event.detail;
    switch (data.message) {
      case "join":
        var userLocal = Users.getLocalUser();

        WebRTC.createPeerConnection(data.roomHash, userLocal.id, data.userId);
        var userRemote = Users.getRemoteUser(data.userId);

        var loop = setInterval(function() {
          if (userLocal.stream === undefined) {
            return;
          } else {
            clearInterval(loop);
            //this will trigger onnegotiationneeded event at the peerConnection
            userRemote.peerConnection.addStream(userLocal.stream);
            trace("webrtc", "Added local stream to peerConnection", userLocal.stream);

            //Bugfix because addStream doesn't fire onnegotiationneeded in firefox nightly 23.01a
            if (navigator.browser[0] === "Firefox") {
              WebRTC.onNegotationNeeded(data.userId);
            }
          }
        }, 500);
        break;
      case "leave":
        Users.removeRemoteUser(data.userId);
        break;
      default:
        trace("webrtc", "Undefined participant message", "-");
        break;
    }
  },
  hangup: function() {
    Users.reset();
    this.initialized = false;
    trace("webrtc", "Reset", "-");
  }
};

var Users = {
  users: [],
  createLocalUser: function() {
    var user = {
      name: undefined,
      id: undefined,
      roomHash: undefined,
      stream: undefined,
      type: "local"
    };

    Users.users.push(user);
    return user;
  },
  createRemoteUser: function(roomHash, remoteUserId, peerConnection, dataChannel) {
    var user = {
      name: undefined,
      id: remoteUserId,
      roomHash: roomHash,
      peerConnection: peerConnection,
      stream: undefined,
      dataChannel: dataChannel,
      type: "remote"
    };

    setTimeout(function() {
      $('#videoboxes').append("<div class='user' id='" + remoteUserId + "'><span class='name'>Name</span><video autoplay></video><form action='javascript:void(0);'><textarea rows='4' READONLY></textarea><input placeholder='Nachricht...'/></form></div>");

      $('#' + remoteUserId + " form input").keypress(function(e) {
        if (e.which == 13) {
          var input = $(this).val();
          dataChannel.send(input);

          var hours = new Date().getHours()
          hours = hours < 10 ? "0" + hours : hours;

          var minutes = new Date().getMinutes();
          minutes = minutes < 10 ? "0" + minutes : minutes;

          var output = hours + ":" + minutes + " (me) - " + input + "&#13;&#10;";
          $('#' + remoteUserId + " textarea").append(output)

          $(this).val("");
          return false;
        }
      });
    }, 500);

    Users.users.push(user);
    window.App.Controller.user.set('usersCounter', this.users.length);
  },
  getLocalUser: function() {
    for (var i = 0; i < Users.users.length; i++) {
      if (Users.users[i].type === "local") {
        return Users.users[i];
      }
    }

    alert("There is no local user!");
    return null;
  },
  getRemoteUser: function(id) {
    for (var i = 0; i < Users.users.length; i++) {
      if (Users.users[i].id === id && Users.users[i].type === "remote") {
        return Users.users[i];
      }
    }

    alert("Unknown remote user id: " + data.userId);
    return null;
  },
  removeLocalUser: function() {
    for (var i = 0; i < Users.users.length; i++) {
      if (Users.users[i].type === "local") {
        if (Users.users[i].stream !== undefined) {
          Users.users[i].stream.stop();
        }

        Users.users.splice(i, 1);
        return true;
      }
    }
  },
  removeRemoteUser: function(id) {

    for (var i = 0; i < Users.users.length; i++) {
      if (Users.users[i].id === id && Users.users[i].type === "remote") {
        var user = Users.users[i];

        if (user.peerConnection !== undefined) {
          user.peerConnection.close();
        }
        if (user.dataChannel !== undefined) {
          user.dataChannel.close();
        }

        $('#' + user.id).remove();
        user = null;
        
        window.App.Controller.user.set('usersCounter', this.users.length);

        Users.users.splice(i, 1);
        return true;
      }
    }
    return false;
  },
  removeAllRemotes: function() {
    for (var i = 0; i < Users.users.length; i++) {
      if (Users.users[i].type === "remote") {
        if (Users.users[i].peerConnection !== undefined) {
          Users.users[i].peerConnection.close();
        }
        if (Users.users[i].dataChannel !== undefined) {
          Users.users[i].dataChannel.close();
        }
      }
    }
  },
  reset: function() {
    this.removeAllRemotes();
    this.removeLocalUser();
  }
};

WebRTC.init();
