var SignalingChannel = {
  webSocket: null,
  init: function() {
    var self = this;
    this.webSocket = new WebSocket('ws://www.nucular-bacon.com:49152');

    this.webSocket.onopen = function() {
      console.log("SignalingChannel: ONOPEN");

      var roomHash = prompt("Raumname:", "");
      var roomLink = roomHash ? location.href + "/" + roomHash : location.href;

      this.send(JSON.stringify({
        subject: "init",
        url: roomLink
      }));
    };
    this.webSocket.onmessage = function(message) {
      try {
        data = JSON.parse(message.data);
      } catch(e) {
        console.log("SignalingChannel: Unparsable message from server");
      }

      switch(data.subject) {
        case "init":
          window.dispatchEvent(new CustomEvent("signalingchannel:init", {
            detail: {
              roomHash: data.chatroomHash,
              userId: data.userHash,
              guestIds: data.guestIds,
              error: data.error
            }
          }));
          break;
        case "sdp":
          window.dispatchEvent(new CustomEvent("signalingchannel:sdp", {
            detail: {
              sdp: data.sdp,
              roomHash: data.chatroomHash,
              userId: data.userHash
            }
          }));
          break;
        case "ice":
          if (data.ice) {
            window.dispatchEvent(new CustomEvent("signalingchannel:ice", {
              detail: {
                ice: data.ice,
                roomHash: data.chatroomHash,
                userId: data.userHash
              }
            }));
          } else {
            console.log("SignalingChannel: ICE not usable");
          }
          break;
        case "participant-join":
          window.dispatchEvent(new CustomEvent("signalingchannel:participant", {
            detail: {
              message: "join",
              roomHash: data.chatroomHash,
              userId: data.userHash
            }
          }));
          break;
        case "participant-leave":
          window.dispatchEvent(new CustomEvent("signalingchannel:participant", {
            detail: {
              message: "leave",
              roomHash: data.chatroomHash,
              userId: data.userHash
            }
          }));
          break;
        default:
          console.log("SignalingChannel: Unknown subject in message!");
          break;
      };
    };
    this.webSocket.onerror = function(error) {
      console.log("SignalingChannel: ERROR");
    };
    this.webSocket.onclose = function() {
      console.log("SignalingChannel: CLOSE");
    };
  },
  send: function(message) {
    console.log("SignalingChannel: " + message)
    SignalingChannel.webSocket.send(JSON.stringify(message));
  },
  close: function() {
    this.webSocket.onclose = function() {
    };
    this.webSocket.close();
  }
};
