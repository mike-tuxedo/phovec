var WebRTC = {
  init: function() {
    window.addEventListener("localmedia:available", this.handleLocalMedia);
    window.addEventListener("signalingchannel:init", this.handleSignalingInit);
    window.addEventListener("signalingchannel:sdp", this.handleSignalingSdp);
    window.addEventListener("signalingchannel:ice", this.handleSignalingIce);
    window.addEventListener("signalingchannel:participant", this.handleSignalingParticipant);

    WebRTC.createLocalUser();
  },
  users: [],
  handleLocalMedia: function(event) {
    trace(" webrtc  ", "Local Media Available", event);

    var user = WebRTC.getLocalUser();
    user.stream = event.detail.stream;
  },
  handleSignalingInit: function(event) {
    trace(" webrtc  ", "Signaling Init", event);

    var data = event.detail;

    /* set url according to the room-hash */
    App.handleURL('room/' + data.roomHash);
    App.Router.router.replaceURL('/room/' + data.roomHash);

    /**
     * Create remote users
     * Have to be before the modification of the local user,
     * because there could be action with the remote user now
     */
    for (var i = 0; i < data.guestIds.length; i++) {
      WebRTC.createRemoteUser(data.roomHash, data.userId, data.guestIds[i].id)
    }

    /**
     * Modify local user
     */
    var user = WebRTC.getLocalUser();
    user.roomHash = data.roomHash;
    user.id = data.userId;
    var localName = "Lukas";
    //prompt("Nickname:", "Bitte Namen wählen...");
    user.name = localName;

    $('#local_name').text(localName);
    $('#videoboxes #local').attr("id", data.userId);
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
    return user;
  },
  createRemoteUser: function(roomHash, userId, remoteUserId) {
    var RTC_CONFIGURATION = {
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

    if (navigator.browser[0] === "Chrome") {
      var peerConnection = new PeerConnection(RTC_CONFIGURATION, {
        'optional': [{
          'DtlsSrtpKeyAgreement': 'true'
        }]
      });
    } else if (navigator.browser[0] === "Firefox") {
      var peerConnection = new PeerConnection(RTC_CONFIGURATION, {
        'optional': [{}]
      });
    } else {
      alert("Bitte benutze Chrome oder Firefox!");
      return;
    }

    peerConnection.onicecandidate = function(description) {
      trace(" webrtc  ", "Got Ice from STUN", description);

      SignalingChannel.send({
        subject: "ice",
        chatroomHash: roomHash,
        userHash: userId,
        destinationHash: remoteUserId,
        ice: description.candidate
      });
    };

    peerConnection.onaddstream = function(remote) {
      trace(" webrtc  ", "Remote Stream arrived", remote);

      $('#' + remoteUserId + ' video').attr('src', URL.createObjectURL(remote.stream));
      if (navigator.browser[0] === "Firefox") {
        $('#' + remoteUserId + ' video').get(0).play();
      }
    };

    var user = {
      name: undefined,
      id: remoteUserId,
      roomHash: roomHash,
      peerConnection: peerConnection,
      stream: undefined,
      channel: undefined,
      type: "remote"
    };

    $('#videoboxes').append("<div class='user' id='" + remoteUserId + "'><span class='name'>Name</span><video autoplay></video><form action='javascript:void(0);'><textarea rows='4' READONLY></textarea><input placeholder='Nachricht...'/></form></div>");
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
    trace(" webrtc  ", "Handle SDP", event);

    var data = event.detail;
    var userRemote = WebRTC.getRemoteUser(data.userId);
    var userLocal = WebRTC.getLocalUser();

    trace(" webrtc  ", "Set remote Description", event);

    userRemote.peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp), function() {
      trace(" webrtc  ", "Success set remote description", event);
    }, function() {
      trace(" webrtc  ", "Failure set remote description", event);
    });

    if (!userRemote.peerConnection.localDescription) {
      var loop = setInterval(function() {
        if (userLocal.stream === undefined) {
          return;
        } else {
          clearInterval(loop);
          userRemote.peerConnection.addStream(userLocal.stream);
          trace(" webrtc  ", "Added local stream to peerConnection before createAnswer", userLocal.stream);
          userRemote.peerConnection.createAnswer(function(description) {
            trace(" webrtc  ", "CreateAnswer Callback called", description);
            trace(" webrtc  ", "Set local description", description);
            userRemote.peerConnection.setLocalDescription(description, function() {
              trace(" webrtc  ", "Success set local description", event);
            }, function() {
              trace(" webrtc  ", "Failure set local description", event);
            });

            SignalingChannel.send({
              subject: "sdp",
              chatroomHash: userLocal.roomHash,
              userHash: userLocal.id,
              destinationHash: userRemote.id,
              sdp: description
            });
          }, function() {
            trace(" webrtc  ", "Failure at calling createAnswer", "-");
          }, {
            'mandatory': {
              'OfferToReceiveAudio': true,
              'OfferToReceiveVideo': true
            }
          });
        }
      }, 1000);
    }
  },
  modifyDescription: function(description) {
    var sdp = description.sdp;
    var cryptoLine = "a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:BAADBAADBAADBAADBAADBAADBAADBAADBAADBAAD";
    sdp = sdp.replace(/c=/g, cryptoLine + "\nc=");
    description.sdp = sdp;
    return description;
  },
  handleSignalingIce: function(event) {
    trace(" webrtc  ", "Handle Ice Candidate", event);
    var user = WebRTC.getRemoteUser(event.detail.userId);

    if (navigator.browser[0] === "Chrome") {
      user.peerConnection.addIceCandidate(new RTCIceCandidate({
        sdpMLineIndex: event.detail.ice.spdMLineIndex,
        candidate: event.detail.ice.candidate
      }));
    } else if (navigator.browser[0] === "Firefox") {
      user.peerConnection.addIceCandidate(new mozRTCIceCandidaten({
        sdpMLineIndex: event.detail.ice.spdMLineIndex,
        candidate: event.detail.ice.candidate
      }));
    }
  },
  handleSignalingParticipant: function(event) {
    trace(" webrtc  ", "Handle Participant", event);

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
            WebRTCDebugger.update();
            trace(" webrtc  ", "Added local stream to peerConnection before createOffer", userLocal.stream);

            var sdpConstraints = {};
            if (navigator.browser[0] === "Firefox") {
              sdpConstraints = {
                "optional": [],
                "mandatory": {
                  'OfferToReceiveAudio': true,
                  'OfferToReceiveVideo': true,
                  'MozDontOfferDataChannel': true
                }
              };
            } else if (navigator.browser[0] === "Chrome") {
              sdpConstraints = {
                "optional": [],
                "mandatory": {
                  'OfferToReceiveAudio': true,
                  'OfferToReceiveVideo': true
                }
              };
            }

            userRemote.peerConnection.createOffer(function(description) {
              trace(" webrtc  ", "createOffer Callback called", description);
              trace(" webrtc  ", "Set local description", description);
              userRemote.peerConnection.setLocalDescription(description, function() {
                trace(" webrtc  ", "Success set local", description);
              }, function() {
                trace(" webrtc  ", "Failure set local", description);
              });

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
              trace(" webrtc  ", "Failure calling createOffer", "-");
            }, sdpConstraints);
          }
        }, 1000);
        break;
      case "leave":
        WebRTC.removeRemoteUser(data.userId);
        break;
      default:
        trace(" webrtc  ", "Undefined participant message", "-");
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
