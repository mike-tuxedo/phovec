var SignalingChannel = {
  webSocket: null,
  init: function() {
    var self = this;
    this.webSocket = new WebSocket('ws://37.200.99.34:49152');
    this.webSocket.onopen = function() {
      console.log("WebSocket: ONOPEN");
      self.send({
        subject: "init",
        url: location.href
      });
    };
    this.webSocket.onmessage = function(message) {
      try {
        data = JSON.parse(message.data);
      } catch(e) {
        console.log("WebSocket: Unparsable message from server");
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
          console.log('WebSocket: SDP arrived');
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
            console.log("WebSocket: ICE arrived:");

            window.dispatchEvent(new CustomEvent("signalingchannel:ice", {
              detail: {
                ice: data.ice,
                roomHash: data.chatroomHash,
                userId: data.userHash
              }
            }));
          } else {
            console.log("WebSocket: ICE not usable");
          }

          break;
        case "participant-join":
          console.log("WebSocket: Participant-Join " + UserInformations.remoteUserId);

          window.dispatchEvent(new CustomEvent("signalingchannel:participant", {
            detail: {
              message: "join",
              roomHash: data.chatroomHash,
              userId: data.userHash
            }
          }));
          break;
        case "participant-leave":
          //close and reset everything
          break;
        default:
          console.log("WebSocket: Unknown subject in message!");
          break;
      };
    };
    this.webSocket.onerror = function(error) {
      console.log("WebSocket: ERROR");
    };
    this.webSocket.onclose = function() {
      console.log("WebSocket: CLOSE");
    };
  },
  send: function(message) {
    console.log("WebSocket: SEND " + message);
    //TODO: stringify necessary?
    this.webSocket.send(JSON.stringify(message));
  },
  close: function() {
    this.webSocket.onclose = function() {
    };
    this.webSocket.close();
  }
};