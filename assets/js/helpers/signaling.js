var SignalingChannel = {
  webSocket: null,
  isConnected: false,
  init: function() {
    if (this.isConnected) {
      return;
    }

    var self = this;

    try {
      this.webSocket = new WebSocket('ws://www.nucular-bacon.com:49152');
      this.webSocket.onopen = function() {
        trace("signaling", "ONOPEN", "-");
        self.isConnected = true;

        /**
         * Check roomHash length if route "room" is active
         */
        var url = location.href;
        var roomRoute = "\/room\/";
        var indexRoomHash = url.lastIndexOf(roomRoute);

        if (indexRoomHash >= 0) {
          indexRoomHash = indexRoomHash + roomRoute.length;
          if (url.substr(indexRoomHash).length > 40 || url.substr(indexRoomHash).length < 40) {
            App.handleURL('/room/unknown');
            App.Router.router.replaceURL('/room/unknown');
            return;
          }
        }

        /**
         * Send init to signaling server
         */
        this.send(JSON.stringify({
          subject: "init",
          url: location.href,
          name: Users.getLocalUser().name
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
                roomHash: data.roomHash,
                userId: data.userHash,
                guestIds: data.guestIds,
                country: data.country,
                error: data.error
              }
            }));
            break;
          case "sdp":
            //trace("signaling", "SDP", data);
            window.dispatchEvent(new CustomEvent("signalingchannel:sdp", {
              detail: {
                sdp: data.sdp,
                roomHash: data.roomHash,
                userId: data.userHash
              }
            }));
            break;
          case "ice":
            //trace("signaling", "ICE", data);
            if (data.ice) {
              window.dispatchEvent(new CustomEvent("signalingchannel:ice", {
                detail: {
                  ice: data.ice,
                  roomHash: data.roomHash,
                  userId: data.userHash
                }
              }));
            } else {
              //ice not usable
            }
            break;
          case "participant:join":
            //trace("signaling", "JOIN", data);
            window.dispatchEvent(new CustomEvent("signalingchannel:participant", {
              detail: {
                message: "join",
                roomHash: data.roomHash,
                userId: data.userHash,
                country: data.country,
                name: data.name
              }
            }));
            break;
          case "participant:leave":
            //trace("signaling", "LEAVE", data);
            window.dispatchEvent(new CustomEvent("signalingchannel:participant", {
              detail: {
                message: "leave",
                roomHash: data.roomHash,
                userId: data.userHash
              }
            }));
            break;
          case "participant:audio:mute":
            window.dispatchEvent(new CustomEvent("signalingchannel:participant", {
              detail: {
                message: "audio:mute",
                roomHash: data.roomHash,
                userId: data.userHash
              }
            }));
            break;
          case "participant:audio:unmute":
            window.dispatchEvent(new CustomEvent("signalingchannel:participant", {
              detail: {
                message: "audio:unmute",
                roomHash: data.roomHash,
                userId: data.userHash
              }
            }));
            break;
          case "participant:video:mute":
            window.dispatchEvent(new CustomEvent("signalingchannel:participant", {
              detail: {
                message: "video:mute",
                roomHash: data.roomHash,
                userId: data.userHash
              }
            }));
            break;
          case "participant:video:unmute":
            window.dispatchEvent(new CustomEvent("signalingchannel:participant", {
              detail: {
                message: "video:unmute",
                roomHash: data.roomHash,
                userId: data.userHash
              }
            }));
            break;
          case "mail:error":
            window.dispatchEvent(new CustomEvent("signalingchannel:error", {
              detail: {
                message: "mail:error",
                roomHash: data.roomHash,
                userId: data.userHash,
                to: data.to
              }
            }));
            break;
          case "close":
            window.dispatchEvent(new CustomEvent("signalingchannel:close", {
              detail: {
                message: "close",
                roomHash: data.roomHash,
                userId: data.userHash
              }
            }));
            SignalingChannel.close();
            break;
          default:
            trace("signaling", "Unknown subject in message!", data);
            break;
        };
      };
      this.webSocket.onerror = function() {
        trace("signaling", "ERROR", error);
      };
      this.webSocket.onclose = function() {
        self.isConnected = false;
        trace("signaling", "CLOSE", "-");

        App.handleURL('/error');
        App.Router.router.replaceURL('/error');
      };
    } catch(e) {
      trace("signaling", "Server offline", "-");
    }
  },
  send: function(message) {
    //trace("signaling", "SEND", message);
    SignalingChannel.webSocket.send(JSON.stringify(message));
  },
  close: function() {
    if (this.isConnected || this.webSocket) {
      trace("signaling", "CLOSE", "-");
      this.webSocket.onclose = function() {
      };
      this.webSocket.close();
      this.isConnected = false;
    }
  }
};
