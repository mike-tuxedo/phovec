var SignalingChannel = {
  webSocket: null,
  connected: false,
  init: function() {
    var self = this;
    this.webSocket = new WebSocket('ws://www.nucular-bacon.com:49152');

    this.webSocket.onopen = function() {
      trace("signaling", "ONOPEN", "-");
      self.connected = true;

      this.send(JSON.stringify({
        subject: "init",
        url: location.href
      }));
    };
    this.webSocket.onmessage = function(message) {
      var data = "";
      try {
        data = JSON.parse(message.data);
      } catch(e) {
        trace("signaling", "Unparsable message from server", "-");
        return;
      }
      
      switch(data.subject) {
        case "init":
          trace("signaling", "INIT", data);
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
          trace("signaling", "SDP", data);
          window.dispatchEvent(new CustomEvent("signalingchannel:sdp", {
            detail: {
              sdp: data.sdp,
              roomHash: data.chatroomHash,
              userId: data.userHash
            }
          }));
          break;
        case "ice":
          trace("signaling", "ICE", data);
          if (data.ice) {
            window.dispatchEvent(new CustomEvent("signalingchannel:ice", {
              detail: {
                ice: data.ice,
                roomHash: data.chatroomHash,
                userId: data.userHash
              }
            }));
          } else {
            //ice not usable
          }
          break;
        case "participant-join":
          trace("signaling", "JOIN", data);
          window.dispatchEvent(new CustomEvent("signalingchannel:participant", {
            detail: {
              message: "join",
              roomHash: data.chatroomHash,
              userId: data.userHash
            }
          }));
          break;
        case "participant-leave":
          trace("signaling", "LEAVE", data);
          window.dispatchEvent(new CustomEvent("signalingchannel:participant", {
            detail: {
              message: "leave",
              roomHash: data.chatroomHash,
              userId: data.userHash
            }
          }));
          break;
        default:
          trace("signaling", "Unknown subject in message!", data);
          break;
      };
    };
    this.webSocket.onerror = function(error) {
      trace("signaling", "ERROR", error);
    };
    this.webSocket.onclose = function() {
      self.connected = false;
      trace("signaling", "CLOSE", "-");
    };
  },
  send: function(message) {
    trace("signaling", "SEND", message);
    SignalingChannel.webSocket.send(JSON.stringify(message));
  },
  close: function() {
    if (this.webSocket) {
      this.webSocket.onclose = function() {
      };
      this.webSocket.close();
    }
  },
  connectionEstablished: function() {
    return this.connected;
  }
};
