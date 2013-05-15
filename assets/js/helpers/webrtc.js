var WebRTC = {
  initialized: false,
  init: function() {
    if (this.initialized) {
      return true;
    }

    this.initialized = true;

    window.addEventListener("signalingchannel:init", this.handleSignalingInit);
    window.addEventListener("signalingchannel:sdp", this.handleSignalingSdp);
    window.addEventListener("signalingchannel:ice", this.handleSignalingIce);
    window.addEventListener("signalingchannel:participant", this.handleSignalingParticipant);
    window.addEventListener("signalingchannel:error", this.handleSignalingError);
    window.addEventListener("signalingchannel:close", this.handleSignalingKicked);

    Users.createLocalUser();
  },
  createPeerConnection: function(roomHash, userId, remoteUserId, remoteUserName, remoteUserCountry) {
    /**
     * Create PeerConnection
     */
    var peerConnection = new PeerConnection(RTC_CONFIGURATION, RTC_MEDIA_CONSTRAINTS);

    peerConnection.onicecandidate = function(description) {
      //trace("webrtc", "Got Ice from STUN", description);

      SignalingChannel.send({
        subject: "ice",
        roomHash: roomHash,
        userHash: userId,
        destinationHash: remoteUserId,
        ice: description.candidate
      });
    };
    peerConnection.onaddstream = function(event) {
      trace("webrtc", "Remote Stream arrived", event);
      var user = Users.getRemoteUser(remoteUserId);
      user.stream = event.stream;

      if (user.stream.getVideoTracks()[0].enabled === false) {
        $('#' + remoteUserId + ' video').css('opacity', '1');
      }
      if (user.stream.getAudioTracks()[0].enabled === false) {
        $('#' + remoteUserId + ' .stateMute').show();
      }

      $('#' + remoteUserId + ' video').attr('src', URL.createObjectURL(event.stream));
      if (navigator.browser[0] === "Firefox") {
        $('#' + remoteUserId + ' video').get(0).play();
      }

      WebRTC.handleRecordingButtons(remoteUserId, 'video', true);
      WebRTC.handleRecordingButtons(remoteUserId, 'audio', true);

      trace("webrtc", "Remote Stream arrived", event);
    };
    peerConnection.onremovestream = function(event) {
      trace("webrtc", "Remote Stream removed", event);
      $('#' + remoteUserId + ' video').attr('src', '');
    };
    peerConnection.onnegotiationneeded = function() {
      //BUG: onnegotiationneeded gets fired in chrome with datachannel without adding or removing streams
      trace("webrtc", "Negotiationneeded");
      //WebRTC.onNegotationNeeded(remoteUserId);
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
    var dataChannel = peerConnection.createDataChannel('RTCDataChannel', DATACHANNEL_OPTIONS);
    var frameCollection = [];

    dataChannel.onmessage = function(event) {
      console.log("ON MESSAGE");
      var user = Users.getRemoteUser(remoteUserId);
      var data = {};

      try {
        var data = JSON.parse(event.data);
      } catch(e) {
        trace("signaling", "Unparsable message from remote user", "-");
        return;
      }

      switch(data.subject) {
        case "message":
          var output = formatTime(new Date().getTime(), "HH:MM") + " (" + user.name + ") - " + data.content + "&#13;&#10;";
          $('#' + remoteUserId + ' form textarea').append(output);
          break;
        case "file":
          frameCollection.push(data.content);
          console.log(data);

          if (data.lastFrame === true) {
            var dataURL = frameCollection.join('');
            frameCollection = [];

            var a = document.createElement('a');
            a.download = data.name;
            a.setAttribute('href', dataURL);
            a.click();

            trace("webrtc", "RECEIVED File", "-")
          }
          break;
        default:
          trace("webrtc", "unknown data channel subject", "-")
          break;
      }
    };
    dataChannel.onopen = function(event) {
      trace("webrtc", "DataChannel onopen", event);

      var dropArea = $('#' + remoteUserId + " form div").get(0);
      dropArea.addEventListener('dragover', function(event) {
        //stop dragover event is needed, so drop event works in chrome
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }, false);
      dropArea.addEventListener('drop', function(event) {
        event.stopPropagation();
        event.preventDefault();

        var reader = new FileReader();
        var files = event.dataTransfer.files;
        var frameLength = 128;
        //Max. amount of bytes to send via DataChannel

        for (var i = 0; i < files.length; i++) {
          var type = files[i].type;
          var size = files[i].size;
          var name = files[i].name;

          reader.onload = function(event) {
            WebRTC.sendData(remoteUserId, event.target.result, {
              frameLength: frameLength,
              type: type,
              size: size,
              name: name
            });
          };
          reader.readAsDataURL(files[i]);
        }
      }, false);

      $('#' + remoteUserId + " form input").keypress(function(event) {
        if (event.which == 13) {
          var input = $(this).val();
          dataChannel.send(JSON.stringify({
            "subject": "message",
            "content": input
          }));
          $(this).val("");

          var output = formatTime(new Date().getTime(), "HH:MM") + " (me) - " + input + "&#13;&#10;";
          $('#' + remoteUserId + " textarea").append(output);

          event.preventDefault();
          event.stopPropagation();
          return false;
        }
      });

      $('#' + remoteUserId + " form input").removeAttr('disabled');
    };
    dataChannel.onclose = function(event) {
      trace("webrtc", "DataChannel onclose", event);
      $('#' + remoteUserId + " form input").attr('disabled', true);
    };
    dataChannel.onerror = function(event) {
      trace("webrtc", "DataChannel onerror", event);
      $('#' + remoteUserId + " form input").attr('disabled', true);
    };
    peerConnection.ondatachannel = function(event) {
      trace("webrtc", "DataChannel ondatachannel", event);
    };

    Users.createRemoteUser(roomHash, remoteUserId, remoteUserName, remoteUserCountry, peerConnection, dataChannel);
  },
  sendData: function(remoteUserId, dataURL, options, data) {
    if ( typeof data === "undefined") {
      var data = {
        "subject": "file",
        "content": undefined,
        "lastFrame": false,
        "firstFrame": true
      };
    }

    console.log(dataURL.length);

    if (dataURL.length < options.frameLength) {
      data.content = dataURL;
      data.lastFrame = true;
    } else {
      data.content = dataURL.slice(0, options.frameLength);
      dataURL = dataURL.slice(data.content.length);
    }

    if (data.firstFrame === true) {
      data.name = options.name;
      data.size = options.size;
      data.type = options.type;
      data.timestamp = new Date().getTime();
    }

    if (Users.getRemoteUser(remoteUserId).dataChannel.readyState.toLowerCase() == 'open') {
      Users.getRemoteUser(remoteUserId).dataChannel.send(JSON.stringify(data));
      console.log(data);
    } else {
      setTimeout(function(remoteUserId, data) {
        Users.getRemoteUser(remoteUserId).dataChannel.send(JSON.stringify(data));
      }, 1000, remoteUserId, data);
    }
    
    data.firstFrame = false;
    if (data.lastFrame === true) {
      trace("webrtc", "SEND File", "-");
      return;
    }

    setTimeout(WebRTC.sendData, 100, remoteUserId, dataURL, options, data);
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
            trace("webrtc", "Success set local description", description);
          }, function(event) {
            trace("webrtc", "Failure set local description", event);
          });

          SignalingChannel.send({
            subject: "sdp",
            roomHash: userLocal.roomHash,
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
            roomHash: userLocal.roomHash,
            userHash: userLocal.id,
            destinationHash: userRemote.id,
            sdp: description
          });
        }, function(event) {
          trace("webrtc", "Failure set local", event);
        });
      }, function(event) {
        trace("webrtc", "Failure calling createOffer", event);
      }, MEDIA_CONSTRAINTS_OFFER);
    }
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
          App.handleURL('/room/full');
          App.Router.router.replaceURL('/room/full');
          break;
        case "room:unknown":
          App.handleURL('/room/unknown');
          App.Router.router.replaceURL('/room/unknown');
          break;
        default:
          App.handleURL('/error');
          App.Router.router.replaceURL('/error');
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
      WebRTC.createPeerConnection(data.roomHash, data.userId, data.guestIds[i].id, data.guestIds[i].name, data.guestIds[i].country)
    }

    /**
     * Modify local user
     */
    var user = Users.getLocalUser();
    user.roomHash = data.roomHash;
    user.id = data.userId;
    user.country = data.country;
    if (data.guestIds.length <= 0) {
      user.admin = true;
    }

    //BUG FIX EMBER JS take a while to render room layout
    setTimeout(function() {
      var img = (user.country ? user.country : "unknown") + '.png';
      $('#local_name').text(user.name);
      $('#local_name').css('background-image', 'url(assets/img/countries/' + img + ')');
      $('#videoboxes #local').attr("id", data.userId);
    }, 0);
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

            //Bugfix because addStream doesn't fire onnegotiationneeded in firefox nightly 23.01a and
            //onnegotiationneeded gets fired in chrome with datachannel without adding or removing streams
            WebRTC.onNegotationNeeded(data.userId);
          }
        }, 500);
      }
    }, function(event) {
      trace("webrtc", "Failure set remote description", event);
    });
  },
  handleSignalingIce: function(event) {
    //trace("webrtc", "Handle Ice Candidate", event);
    var user = Users.getRemoteUser(event.detail.userId);

    if (event.detail.ice === undefined) {
      user.peerConnection.addIceCandidate(new RTCIceCandidate(event.detail.ice));
    }

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

        WebRTC.createPeerConnection(data.roomHash, userLocal.id, data.userId, data.name, data.country);
        var userRemote = Users.getRemoteUser(data.userId);

        var loop = setInterval(function() {
          if (userLocal.stream === undefined) {
            return;
          } else {
            clearInterval(loop);
            //this will trigger onnegotiationneeded event at the peerConnection
            userRemote.peerConnection.addStream(userLocal.stream);
            trace("webrtc", "Added local stream to peerConnection", userLocal.stream);

            //Bugfix because addStream doesn't fire onnegotiationneeded in firefox nightly 23.01a and
            //onnegotiationneeded gets fired in chrome with datachannel without adding or removing streams
            WebRTC.onNegotationNeeded(data.userId);
          }
        }, 500);
        break;
      case "leave":
        Users.removeRemoteUser(data.userId);
        break;
      case "audio:mute":
        WebRTC.handleRecordingButtons(data.userId, 'audio', false);
        var userRemote = Users.getRemoteUser(data.userId);
        $('#' + userRemote.id + ' .stateMute').show();
        break;
      case "audio:unmute":
        WebRTC.handleRecordingButtons(data.userId, 'audio', true);
        var userRemote = Users.getRemoteUser(data.userId);
        $('#' + userRemote.id + ' .stateMute').hide();
        break;
      case "video:mute":
        WebRTC.handleRecordingButtons(data.userId, 'video', false);
        var userRemote = Users.getRemoteUser(data.userId);
        $('#' + userRemote.id + ' video').css('opacity', '0');
        break;
      case "video:unmute":
        if (WebRTC.firstVideoUnmuteMessage) {
          WebRTC.firstVideoUnmuteMessage = false;
          WebRTC.handleRecordingButtons(data.userId, 'video', true);
          WebRTC.handleRecordingButtons(data.userId, 'audio', true);
        } else {
          WebRTC.handleRecordingButtons(data.userId, 'video', true);
        }
        var userRemote = Users.getRemoteUser(data.userId);
        $('#' + userRemote.id + ' video').css('opacity', '1');
        break;
      default:
        trace("webrtc", "Undefined participant message", "-");
        break;
    }
  },
  handleSignalingError: function(event) {
    trace("webrtc", "Handle Error", event);

    var data = event.detail;

    if (data.subject === 'mail:error') {
      alert('Einladung-Mail zu ' + data.to + ' ist nicht angekommen.');
    }

  },
  handleSignalingKicked: function(event) {
    WebRTC.hangup();
    App.handleURL('/room/hangup');
    App.Router.router.replaceURL('/room/hangup');
  },
  hangup: function() {
    Users.reset();
    this.initialized = false;
    trace("webrtc", "Reset", "-");
  },
  handleRecordingButtons: function(remoteId, type, show) {

    type = type === 'video' ? '.recordRemoteVideo' : '.recordRemoteAudio';

    if (show) {
      $('#' + remoteId + ' ' + type).show();
    } else {
      $('#' + remoteId + ' ' + type).hide();
    }
  },
  firstVideoUnmuteMessage: true
};

var Users = {
  users: [],
  createLocalUser: function() {
    var user = {
      name: undefined,
      id: undefined,
      roomHash: undefined,
      stream: undefined,
      admin: false,
      type: "local"
    };

    Users.users.push(user);
    return user;
  },
  createRemoteUser: function(roomHash, remoteUserId, remoteUserName, remoteUserCountry, peerConnection, dataChannel) {
    var user = {
      name: remoteUserName,
      id: remoteUserId,
      roomHash: roomHash,
      peerConnection: peerConnection,
      stream: undefined,
      country: undefined,
      dataChannel: dataChannel,
      type: "remote"
    };

    Users.users.push(user);

    setTimeout(function() {
      var removeParticipantHTML = "";
      if (Users.getLocalUser().admin === true) {
        removeParticipantHTML = "<div class='removeParticipant' onclick=\"App.Controller.user.removeParticipant('" + remoteUserId + "')\"></div>";
      }

      var img = './assets/img/countries/' + ( remoteUserCountry ? remoteUserCountry : "unknown") + '.png';
      var remoteUserString = "<div class='user' id='" + remoteUserId + "'>" + "<span class='name' style='background-image: url(" + img + ")'>" + remoteUserName + "</span>" + "<div class='videoWrapper'>" + "<div class='stateMute'></div>" + removeParticipantHTML + "<img class='bgAvatar' src='assets/img/avatar.jpg' />" + "<div class='recordRemoteVideo'></div>" + "<div class='recordRemoteAudio'></div>" + "<video autoplay></video>" + "<audio autoplay loop muted></audio>" + "<form action='javascript:void(0);'>" + "<div class='chatOutput' contenteditable='false'></div>" + "<div class='chatInput' contenteditable='true'><input type='image' class='micro_recorder' src='assets/img/micro_recorder_off.png'/></div>" + "</form>" + "</div>" + "</div>";

      $('#videoboxes').append(remoteUserString);

      window.App.Controller.user.set('usersCounter', Users.users.length);
    }, 0);
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

    console.log("Unknown remote user id: " + id);
    return null;
  },
  getRemoteUsers: function() {
    var remoteUsers = [];

    for (var i = 0; i < Users.users.length; i++) {
      if (Users.users[i].type === "remote") {
        remoteUsers.push(Users.users[i]);
      }
    }

    return remoteUsers;
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

        if (user.peerConnection.signalingState !== undefined) {
          //user.peerConnection.close();
        }
        if (user.dataChannel !== undefined) {
          //user.dataChannel.close();
        }

        $('#' + user.id).remove();
        user = null;

        Users.users.splice(i, 1);
        window.App.Controller.user.set('usersCounter', Users.users.length);
        return true;
      }
    }
    return false;
  },
  removeAllRemotes: function() {
    for (var i = 0; i < Users.users.length; i++) {
      if (Users.users[i].type === "remote") {
        if (Users.users[i].peerConnection.signalingState !== closed) {
          //Bugfix: Which attribute shows if calling close is possible and don't throws an error
          //Users.users[i].peerConnection.close();
        }
        if (Users.users[i].dataChannel !== undefined) {
          //Users.users[i].dataChannel.close();
        }
      }
    }
  },
  reset: function() {
    this.removeAllRemotes();
    this.removeLocalUser();
  }
};

