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
    console.log("WebRTC: LOCAL MEDIA AVAILABLE ", event);

    var user = WebRTC.getLocalUser();
    user = (user === undefined) ? WebRTC.createLocalUser() : user;
    user.stream = event.detail.stream;
  },
  handleSignalingInit: function(event) {
    var data = event.detail;

    /**
     * Modify local user
     */
    var user = WebRTC.getLocalUser();
    user = (user === undefined) ? WebRTC.createLocalUser() : user;
    user.name = localName;
    user.roomHash = data.roomHash;
    user.id = data.userId;

    var localName = prompt("Nickname:", "Bitte Namen wählen...");
    $('#local_name').text(localName);
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
        optional: []
      });
    } else if (navigator.browser[0] === "Firefox") {
      var peerConnection = new PeerConnection({
        "iceServers": [{
          "url": "stun:provserver.televolution.net"
        }, {
          "url": "stun:stun1.voiceeclipse.net"
        }]
      }, {
        optional: []
      });
    } else {
      alert("Bitte benutze Chrome oder Firefox!");
      return;
    }

    peerConnection.onicecandidate = function(description) {
      console.log("WebRTC: GOT ICE FROM STUN ", description);

      SignalingChannel.send({
        subject: "ice",
        chatroomHash: roomHash,
        userHash: userId,
        destinationHash: remoteUserId,
        ice: description.candidate
      });
    };

    peerConnection.onaddstream = function(remote) {
      console.log("WebRTC: STREAM ARRIVED ", remote);

      $('#' + remoteUserId + ' video').attr('src', URL.createObjectURL(remote.stream));

      if (navigator.browser[0] === "Firefox") {
        $('#' + remoteUserId + ' video').get(0).play();
      }
    };

    /*var channel = peerConnection.createDataChannel('RTCDataChannel');
     channel.onmessage = function(event) {
     if (event.data.substr(0, 4) == "\\$cn") {
     user.name = event.data.substr(4);
     $('#' + remoteUserId + ' .name').text(user.name);
     } else if ( typeof event.data == Blob) {
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
     var name = $('#' + remoteUserId + ' .name').text();
     var output = new Date().getHours() + ":" + new Date().getMinutes() + " (" + name + ") - " + event.data + "&#13;&#10;";
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
        channel.send(input);

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
    console.log("WebRTC: HANDLE SDP ", event);

    var data = event.detail;
    var userRemote = WebRTC.getRemoteUser(data.userId);
    var userLocal = WebRTC.getLocalUser();
    console.log("WebRTC: SET REMOTE ", event);

    console.log("USERREMOTE: ", userRemote);
    userRemote.peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));

    if (!userRemote.peerConnection.localDescription) {
      var loop = setInterval(function() {
        if (userLocal.stream === undefined) {
          return;
        } else {
          clearInterval(loop);
          userRemote.peerConnection.addStream(userLocal.stream);
          console.log("ADDED LOCAL STREAM");
          userRemote.peerConnection.createAnswer(function(description) {
            console.log("WebRTC: CREATE ANSWER CALLBACK ", description);
            userRemote.peerConnection.setLocalDescription(description);
            console.log("WebRTC: SET LOCAL ", description);
            SignalingChannel.send({
              subject: "sdp",
              chatroomHash: userLocal.roomHash,
              userHash: userLocal.id,
              destinationHash: userRemote.id,
              sdp: description
            });
          }, null, {
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
    console.log("WebRTC: HANDLE ICE ", event);
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
    console.log("WebRTC: PARTICIPANT ", event);

    var data = event.detail;
    switch (data.message) {
      case "join":
        var userLocal = WebRTC.getLocalUser();

        WebRTC.createRemoteUser(data.roomHash, userLocal.id, data.userId);
        var userRemote = WebRTC.getRemoteUser(data.userId);

        console.log("USERREMOTE: ", userRemote);

        var loop = setInterval(function() {
          if (userLocal.stream === undefined) {
            return;
          } else {
            clearInterval(loop);
            userRemote.peerConnection.addStream(userLocal.stream);
            console.log("ADDED LOCAL STREAM");

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
              console.log("WebRTC: CREATE OFFER CALLBACK ", description);
              userRemote.peerConnection.setLocalDescription(description);
              console.log("WebRTC: SET LOCAL ", description);

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
            }, null, sdpConstraints);
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
