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
  createPeerConnection: function(roomHash, userId, remoteUserId, remoteUserName, remoteUserCountry, callType) {
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

      if (user.isAudioEnabled !== false) {
        WebRTC.handleRecordingButtons(user.id, 'audio', true);
      }
      if (user.isVideoEnabled !== false) {
        WebRTC.handleRecordingButtons(user.id, 'video', true);
      }

      $('#' + remoteUserId + ' video').attr('src', URL.createObjectURL(event.stream));
      if (navigator.browser[0] === "Firefox") {
        $('#' + remoteUserId + ' video').get(0).play();
      }
    };
    peerConnection.onremovestream = function(event) {
      trace("webrtc", "Remote Stream removed", event);
      $('#' + remoteUserId + ' video').attr('src', '');
    };
    peerConnection.onnegotiationneeded = function() {
      trace("webrtc", "Negotiationneeded", "-");
      var userRemote = Users.getRemoteUser(remoteUserId);
      var userLocal = Users.getLocalUser();

      //Check if local stream is already added, if not add it
      if (userLocal.stream !== undefined) {
        var localStream = userRemote.peerConnection.getLocalStreams()[0];
        //When there is already a added stream
        if (localStream !== undefined) {
          //When the stream isn't already the added one
          if (localStream.id !== userLocal.stream.id) {
            trace("webrtc", "Add local Stream", userLocal.stream);
            WebRTC.sendTrackInfo(userLocal);
            userRemote.peerConnection.addStream(userLocal.stream);
            return;
          }
        } else {
          trace("webrtc", "Add local Stream", "-");
          WebRTC.sendTrackInfo(userLocal);
          userRemote.peerConnection.addStream(userLocal.stream);
          return;
        }
      }

      if (userRemote.callType === "offerer") {
        WebRTC.createOffer(userLocal, userRemote);
        userRemote.callType = "both";
      } else if (userRemote.callType === "both") {
        WebRTC.createOffer(userLocal, userRemote);
      }
    };
    peerConnection.onsignalingstatechange = function() {
      WebRTCDebugger.update();
    };
    peerConnection.oniceconnectionstatechange = function() {
      WebRTCDebugger.update();
    };

    /**
     * Create User
     */
    Users.createRemoteUser(roomHash, remoteUserId, remoteUserName, remoteUserCountry, peerConnection, callType);

    /**
     * Create DataChannel
     */
    var dataChannel = peerConnection.createDataChannel('RTCDataChannel', DATACHANNEL_OPTIONS);
    var frameCollection = [];
    var file = undefined;

    //TODO: When File zur Übertragung bereit, dann kein anderes File übertragbar
    dataChannel.onmessage = function(event) {
      trace("webrtc", "ON MESSAGE DATACHANNEL", "-");
      var user = Users.getRemoteUser(remoteUserId);
      user.transferVisualizer = new TransferVisualizer(remoteUserId);
      var data = {};

      try {
        var data = JSON.parse(event.data);
      } catch(e) {
        trace("signaling", "Unparsable message from remote user", "-");
        return;
      }

      switch(data.subject) {
        case "message":
          var output = formatTime(new Date().getTime(), "HH:MM") + " (" + user.name + ") - " + data.content + "&#13;&#10;<br>";
          WebRTC.insertDataOutput(user.id, output);
          break;
        case "transfer:request":
          var outputType = data.name.substr(data.name.lastIndexOf("."));
          var outputName = data.name.length > 13 ? data.name.substr(0, 10) + outputType : data.name;
          var transferRequest = "<div class='fileDropped'><img src='assets/img/file.png'><span class='fileName'>" + outputName + "</span><span class='fileStatus'><input type='button' onclick=\"WebRTC.acceptTransfer('" + remoteUserId + "');\" value='Annehmen'/></span></div>";
          WebRTC.insertDataOutput(user.id, transferRequest);
          break;
        case "transfer:response":
          if (data.content === "OK") {
            var reader = new FileReader();
            reader.onload = function(event) {
              WebRTC.sendData(user.id, event.target.result, {
                frameLength: 128,
                type: file.type,
                size: file.size,
                name: file.name
              });
            };
            reader.readAsDataURL(file);
          }
          break;
        case "file":
          //TODO: Debugging when receiver has canceled file transfer
          //console.log(user.transferVisualizer.isCanceled);
          //first check if the receiver user hasn't canceled the transfer
          if (user.transferVisualizer.isCanceled === true) {
            //console.log("IS CANCELED! SEND CANCEL!")
            data.error = "canceled";
            user.dataChannel.send(JSON.stringify(data));
            return;
          }

          //if there is an error from the sender side cancel the transfer also
          if (data.error !== undefined) {
            if (data.error === "canceled") {
              //console.log("IS FROM OTHER CANCELED!");
              trace("webrtc", "CANCELED File", "-");
              user.transferVisualizer.cancel();
              frameCollection = [];
              return;
            }
          }

          //initialize the transfervisualizer on first-frame
          if (data.firstFrame === true) {
            user.transferVisualizer.setup({
              "isSender": false
            });
          }

          user.transferVisualizer.update(data);
          frameCollection.push(data.content);

          if (data.lastFrame === true) {
            var dataURL = frameCollection.join('');
            frameCollection = [];

            user.transferVisualizer.complete();

            //at the end you give the user a link do download the file
            var fileDroppedElements = $("#" + user.id + " .fileStatus");
            var fileStatus = fileDroppedElements[fileDroppedElements.length - 1];
            fileStatus.innerHTML = "";

            var a = document.createElement('a');
            a.download = data.name;
            a.setAttribute('href', dataURL);
            a.innerHTML = "Speichern";
            a.onclick = function() {
              fileStatus.innerHTML = "Gespeichert";
            }

            fileStatus.appendChild(a);
            trace("webrtc", "RECEIVED File", "-");
          }
          break;
        default:
          trace("webrtc", "unknown data channel subject", "-")
          break;
      }
    };
    dataChannel.onopen = function(event) {
      trace("webrtc", "DataChannel onopen", event);

      $("#" + remoteUserId + " .connectionInfo").text("Verbindung aufgebaut");
      $("#" + remoteUserId + " .connectionInfo").css("background", "#36ba3c");
      setTimeout(function() {
        $("#" + remoteUserId + " form").fadeIn("slow");
        $("#" + remoteUserId + " .connectionInfo").hide();
        $("#" + remoteUserId + " form .input").focus();
      }, 1250);

      var dragOver = function(event) {
        //stop dragover event is needed, so drop event works in chrome
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      };

      var drop = function(event) {
        event.stopPropagation();
        event.preventDefault();

        var files = event.dataTransfer.files;
        //Currently only one file can be submitted
        file = files[0];

        dataChannel.send(JSON.stringify({
          "subject": "transfer:request",
          "content": "file",
          "name": file.name,
          "size": file.size,
          "type": file.type
        }));

        var outputType = file.name.substr(file.name.lastIndexOf("."));
        var outputName = file.name.length > 13 ? file.name.substr(0, 10) + outputType : file.name;

        var info = "<div class='fileDropped'><img src='assets/img/file.png'><span class='fileName'>" + outputName + "</span><span class='fileStatus'>Warte auf Annahme...</span></div>";
        WebRTC.insertDataOutput(remoteUserId, info);
      };

      var dropAreaVideo = $('#' + remoteUserId + " .videoWrapper").get(0);
      var dropAreaForm = $('#' + remoteUserId + " form").get(0);
      dropAreaVideo.addEventListener('dragover', dragOver, false);
      dropAreaVideo.addEventListener('drop', drop, false);
      dropAreaForm.addEventListener('dragover', dragOver, false);
      dropAreaForm.addEventListener('drop', drop, false);

      $("#" + remoteUserId + " form .input").keypress(function(event) {
        if ((event.altKey === true || event.ctrlKey === true || event.shiftKey === true) && event.which === 13) {
          var content = $(this).html();
          $(this).html(content + "&#13;&#10;<br>");
        } else if (event.which === 13) {
          var input = $(this).html();
          input = WebRTC.insertFacesIntoHTML(input);
          dataChannel.send(JSON.stringify({
            "subject": "message",
            "content": input
          }));
          $(this).html("");

          var output = formatTime(new Date().getTime(), "HH:MM") + " (ich) - " + input + "&#13;&#10;<br>";
          WebRTC.insertDataOutput(remoteUserId, output);

          event.preventDefault();
          event.stopPropagation();
          return false;
        }
      });

      $("#" + remoteUserId + " form .input").attr('contenteditable', 'true');
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

    Users.getRemoteUser(remoteUserId).dataChannel = dataChannel;
  },
  sendData: function(remoteUserId, dataURL, options, data, transferVisualizer) {
    //initialize data
    if ( typeof data === "undefined") {
      data = {
        "subject": "file",
        "content": undefined,
        "lastFrame": false,
        "firstFrame": true,
        "completeSendedDataLength": 0,
        "completeDataLength": dataURL.length
      };

      var userRemote = Users.getRemoteUser(remoteUserId);
      transferVisualizer = userRemote.transferVisualizer;
      transferVisualizer.setup({
        "isSender": true
      });
    }

    //User canceled the transfer
    if (transferVisualizer.isCanceled === true) {
      trace("webrtc", "CANCELED File", "-");

      data.lastFrame = true;
      data.error = "canceled";
      Users.getRemoteUser(remoteUserId).dataChannel.send(JSON.stringify(data));

      transferVisualizer.cancel();
      return;
    }

    //User paused the transfer
    if (transferVisualizer.isPaused === true) {
      var fileDroppedElements = $("#" + remoteUserId + " .fileStatus");
      fileDroppedElements[fileDroppedElements.length - 1].innerHTML = "Pausiert";

      setTimeout(WebRTC.sendData, 100, remoteUserId, dataURL, options, data, transferVisualizer);
      return;
    }

    //Slices the data till the last frame
    if (dataURL.length < options.frameLength) {
      data.content = dataURL;
      data.lastFrame = true;
    } else {
      data.content = dataURL.slice(0, options.frameLength);
      dataURL = dataURL.slice(data.content.length);
    }

    //Add Meta-Data to the first frame
    if (data.firstFrame === true) {
      data.name = options.name;
      data.size = options.size;
      data.type = options.type;
      data.timestamp = new Date().getTime();
    }

    //Try to send data through the datachannel otherwise wait and try again
    if (Users.getRemoteUser(remoteUserId).dataChannel.readyState.toLowerCase() == 'open') {
      Users.getRemoteUser(remoteUserId).dataChannel.send(JSON.stringify(data));
    } else {
      setTimeout(WebRTC.sendData, 100, remoteUserId, dataURL, options, data, transferVisualizer);
      return;
    }

    //visualize the progress of the transfer
    data.completeSendedDataLength += options.frameLength;
    transferVisualizer.update(data);

    //when the last frame got send cancel the recursion function calls
    data.firstFrame = false;
    if (data.lastFrame === true) {
      transferVisualizer.complete();
      trace("webrtc", "SEND File", "-");
      return;
    }

    //call function recursive to send the next frame
    setTimeout(WebRTC.sendData, 200, remoteUserId, dataURL, options, data, transferVisualizer);
  },
  modifyDescription: function(description) {
    var sdp = description.sdp;
    var cryptoLine = "a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:BAADBAADBAADBAADBAADBAADBAADBAADBAADBAAD";
    sdp = sdp.replace(/c=/g, cryptoLine + "\nc=");
    description.sdp = sdp;
    return description;
  },
  createAnswer: function(userLocal, userRemote) {
    trace("webrtc", "Call createAnswer", "-");
    userRemote.peerConnection.createAnswer(function(description) {
      trace("webrtc", "CreateAnswer Callback called", description);
      trace("webrtc", "Set local description", description);
      userRemote.peerConnection.setLocalDescription(description, function() {
        trace("webrtc", "Success set local description", description);
        SignalingChannel.send({
          subject: "sdp",
          roomHash: userLocal.roomHash,
          userHash: userLocal.id,
          destinationHash: userRemote.id,
          sdp: description
        });
      }, function(event) {
        trace("webrtc", "Failure set local description", event);
      });

    }, function(event) {
      trace("webrtc", "Failure at calling createAnswer", event);
    }, MEDIA_CONSTRAINTS_ANSWER);
  },
  createOffer: function(userLocal, userRemote) {
    trace("webrtc", "Call createOffer", "-");
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
  },
  acceptTransfer: function(remoteUserId) {
    var user = Users.getRemoteUser(remoteUserId);
    user.dataChannel.send(JSON.stringify({
      "subject": "transfer:response",
      "content": "OK"
    }));
    var fileDroppedElements = document.getElementById(user.id).getElementsByClassName("fileStatus");
    fileDroppedElements[fileDroppedElements.length - 1].innerHTML = "Übertragung...";
  },
  sendTrackInfo: function(userLocal) {
    if (userLocal.stream.getVideoTracks()[0].enabled === false) {
      SignalingChannel.send({
        subject: "participant:video:mute",
        roomHash: userLocal.roomHash,
        userHash: userLocal.id
      });
    }
    if (userLocal.stream.getAudioTracks()[0].enabled === false) {
      SignalingChannel.send({
        subject: "participant:audio:mute",
        roomHash: userLocal.roomHash,
        userHash: userLocal.id
      });
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
    /* only if we aren't already at the right url */
    if (window.location.origin + "/#/room/" + data.roomHash !== location.href) {
      App.handleURL('room/' + data.roomHash);
      App.Router.router.replaceURL('/room/' + data.roomHash);
    }

    /**
     * Create remote users
     * Have to be before the modification of the local user,
     * because there could be action with the remote user now
     */

    for (var i = 0; i < data.users.length; i++) {
      WebRTC.createPeerConnection(data.roomHash, data.userId, data.users[i].id, data.users[i].name, data.users[i].country, "answerer")
    }

    /**
     * Modify local user
     */
    var user = Users.getLocalUser();
    user.roomHash = data.roomHash;
    user.id = data.userId;
    user.country = data.country;
    Users.updateLocalUserView();

    if (data.users.length <= 0) {
      user.admin = true;
    }
  },
  handleSignalingSdp: function(event) {
    trace("webrtc", "Handle SDP", event);

    var data = event.detail;
    var userRemote = Users.getRemoteUser(data.userId);
    var userLocal = Users.getLocalUser();

    trace("webrtc", "Set remote Description", event);
    userRemote.peerConnection.setRemoteDescription(new RTCSessionDescription({
      type: data.sdp.type,
      sdp: data.sdp.sdp
    }), function() {
      trace("webrtc", "Success set remote description", event);

      if (userRemote.callType === "answerer") {
        userRemote.callType = "both";
      }

      if (data.sdp.type === "offer") {
        WebRTC.createAnswer(userLocal, userRemote);
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
        WebRTC.createPeerConnection(data.roomHash, userLocal.id, data.userId, data.name, data.country, "offerer");
        break;
      case "leave":
        Users.removeRemoteUser(data.userId);

        var remoteUsers = Users.getRemoteUsers();
        remoteUsers.forEach(function(user, index) {
          user.number = index + 1;
          App.Controller.room.updateUser(user);
        });
        $('#faceDetectorOutput').hide();
        break;
      case "edit":
        var remoteUser = Users.getRemoteUser(data.userId);
        remoteUser.name = data.name;
        App.Controller.room.updateUser(remoteUser);
        break;
      case "audio:mute":
        WebRTC.handleRecordingButtons(data.userId, 'audio', false);
        var userRemote = Users.getRemoteUser(data.userId);
        $('#' + userRemote.id + ' .stateMute').show();
        //for setting buttons visible when the stream arrives
        userRemote.isAudioEnabled = false;
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
        //for setting buttons visible when the stream arrives
        userRemote.isVideoEnabled = false;
        break;
      case "video:unmute":
        WebRTC.handleRecordingButtons(data.userId, 'video', true);
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
  insertDataOutput: function(remoteUserId, data) {
    var outputField = $('#' + remoteUserId + " form .output");
    outputField.append(data);
    outputField.scrollTop(outputField[0].scrollHeight);
  },
  insertFacesIntoHTML: function(html) {
    html = html.replace(/\:\)/g, '<img src="assets/img/smile_face.png" class="chatFaces"/>');
    html = html.replace(/\:-\)/g, '<img src="assets/img/smile_face.png" class="chatFaces"/>');
    html = html.replace(/\:\(/g, '<img src="assets/img/sad_face.png" class="chatFaces"/>');
    html = html.replace(/\;\)/g, '<img src="assets/img/wink_face.png" class="chatFaces"/>');
    html = html.replace(/\:d/g, '<img src="assets/img/grin_face.png" class="chatFaces"/>');
    return html;
  },
  firstVideoUnmuteMessage: true
};

var Users = {
users: [],
initLocalUser: false,
createLocalUser: function() {
var user = {
roomHash: undefined,
_stream: undefined,
admin: false,
type: "local",
_name: undefined,
_id: undefined,
_country: undefined,
// adding stream to user and his peerConnection
// event "onaddstream" gets called 500ms after adding
set stream(stream) {
this._stream = stream;

var users = Users.getRemoteUsers();
for(var i=0; i<users.length; i++){
users[i].peerConnection.addStream(stream);
trace("Users", "Added local stream to peerConnection", stream);
}
},
get stream(){
return this._stream;
},
get name(){
return this._name;
},
set name(name){
Users.updateLocalUserView();
this._name = name;
},
get id(){
return this._id;
},
set id(id){
Users.updateLocalUserView();
this._id = id;
},
get country(){
return this._country;
},
set country(country){
Users.updateLocalUserView();
this._country = country;
}
};
Users.users.push(user);
return user;
}, updateLocalUserView: function() {
  var user = Users.getLocalUser();
  var img = (user.country ? user.country : "unknown") + '.png';
  $('.user.local .userName').text(user.name);
  $('.user.local .userHead').css('background-image', 'url(./assets/img/countries/' + img + ')');
  $('#videoboxes #local').attr("id", user.id);
}, createRemoteUser: function(roomHash, remoteUserId, remoteUserName, remoteUserCountry, peerConnection, callType) {
  var user = {
    name: remoteUserName,
    id: remoteUserId,
    roomHash: roomHash,
    peerConnection: peerConnection,
    stream: undefined,
    dataChannel: undefined,
    type: "remote",
    number: Users.users.length,
    country: remoteUserCountry,
    callType: callType
  };

  Users.users.push(user);
  window.App.Controller.room.addRemoteUser(user);
}, getLocalUser: function() {
  for (var i = 0; i < Users.users.length; i++) {
    if (Users.users[i].type === "local") {
      return Users.users[i];
    }
  }

  return this.createLocalUser();
}, getRemoteUser: function(id) {
  for (var i = 0; i < Users.users.length; i++) {
    if (Users.users[i].id === id && Users.users[i].type === "remote") {
      return Users.users[i];
    }
  }
  return null;
}, getRemoteUsers: function() {
  var remoteUsers = [];

  for (var i = 0; i < Users.users.length; i++) {
    if (Users.users[i].type === "remote") {
      remoteUsers.push(Users.users[i]);
    }
  }

  return remoteUsers;
}, removeLocalUser: function() {
  for (var i = 0; i < Users.users.length; i++) {
    if (Users.users[i].type === "local") {
      if (Users.users[i].audioVisualizer !== undefined) {
        Users.users[i].audioVisualizer.stop();
      }

      if (Users.users[i].stream !== undefined) {
        Users.users[i].stream.stop();
        delete Users.users[i].stream;
      }

      //reseting the video and audio tags
      var elements = $("video, audio");
      for (var i = 0; i < elements.length; i++) {
        elements[i].src = "";
        elements[i] = null;
      };

      Users.users.splice(i, 1);
      return true;
    }
  }
}, removeRemoteUser: function(id) {
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
      var boxes = document.getElementsByClassName('user').length;
      window.App.Controller.user.set('userBoxes', boxes - 1);
      return true;
    }
  }
  return false;
}, removeAllRemotes: function() {
  for (var i = 0; i < Users.users.length; i++) {
    if (Users.users[i].type === "remote") {
      if (Users.users[i].peerConnection.signalingState !== closed) {
        //Bugfix: Which attribute shows if calling close is possible and don't throws an error
        //Users.users[i].peerConnection.close();
      }
      if (Users.users[i].dataChannel !== undefined) {
        //Users.users[i].dataChannel.close();
      }
      Users.users[i] = null;
    }
  }
}, reset: function() {
  this.initLocalUser = false;
  this.removeAllRemotes();
  this.removeLocalUser();
}
};