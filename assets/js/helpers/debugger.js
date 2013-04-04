/**
 * For Debugging WebRTC Helper
 */
var WebRTCDebugger = {
  update: function() {
    if (Users.users[1] !== undefined && Users.users[1].peerConnection !== undefined) {
      $('#debugger #localDescription').text(Users.users[1].peerConnection.localDescription);
      $('#debugger #remoteDescription').text(Users.users[1].peerConnection.remoteDescription);
      $('#debugger #signalingState').text(Users.users[1].peerConnection.signalingState);
      $('#debugger #iceGatheringState').text(Users.users[1].peerConnection.iceGatheringState);
      $('#debugger #iceConnectionState').text(Users.users[1].peerConnection.iceConnectionState);
    }
    else{
      $('#debugger #localDescription, #debugger #iceConnectionState, #debugger #iceGatheringState, #debugger #signalingState, #debugger #remoteDescription').text("-");
    }
  }
};

/**
 * Open Debug-Window
 */
$(document).keydown(function(event) {
  if (event.altKey && event.keyCode === 68) {
    $('#debugger').toggle();
  }
});
