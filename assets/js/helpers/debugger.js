/**
 * For Debugging WebRTC Helper
 */
var WebRTCDebugger = {
  update: function() {
    if (WebRTC.users[1] !== undefined && WebRTC.users[1].peerConnection !== undefined) {
      $('#debugger #localDescription').text(WebRTC.users[1].peerConnection.localDescription);
      $('#debugger #remoteDescription').text(WebRTC.users[1].peerConnection.remoteDescription);
      $('#debugger #signalingState').text(WebRTC.users[1].peerConnection.signalingState);
      $('#debugger #iceGatheringState').text(WebRTC.users[1].peerConnection.iceGatheringState);
      $('#debugger #iceConnectionState').text(WebRTC.users[1].peerConnection.iceConnectionState);
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
