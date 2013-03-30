var SignalingChannel = {
  webSocket: null,
  connected : false,
  init: function() {
    var self = this;
    this.webSocket = new WebSocket('ws://www.nucular-bacon.com:49152');

    this.webSocket.onopen = function() {
      console.log("SignalingChannel: ONOPEN");
      self.connected = true;
      
      this.send(JSON.stringify({
        subject: "init",
        url: location.href
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
          console.log("SignalingChannel: INIT ", data);
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
          console.log("SignalingChannel: SDP ", data);
          window.dispatchEvent(new CustomEvent("signalingchannel:sdp", {
            detail: {
              sdp: data.sdp,
              roomHash: data.chatroomHash,
              userId: data.userHash
            }
          }));
          break;
        case "ice":
          //console.log("SignalingChannel: ICE ", data);
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
          console.log("SignalingChannel: JOIN ", data);
          window.dispatchEvent(new CustomEvent("signalingchannel:participant", {
            detail: {
              message: "join",
              roomHash: data.chatroomHash,
              userId: data.userHash
            }
          }));
          break;
        case "participant-leave":
          console.log("SignalingChannel: LEAVE ", data);
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
    //console.log("SignalingChannel: SEND " + new Date().getTime() + " ", message);
    SignalingChannel.webSocket.send(JSON.stringify(message));
  },
  close: function() {
    this.webSocket.onclose = function() {
    };
    this.webSocket.close();
  },
  connectionEstablished: function(){
    return this.connected;
  }
};
