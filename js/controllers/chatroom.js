App.ChatroomController = Ember.Controller.extend({

  showInvitationForm: function(){
    var view = App.InvitationView.create();
    view.appendTo('#messageBox');
  },
  
  sendInvitation: function(){
    
    // TODO: implement mail module, be careful to send url of chatroom as well
    var address = $('#invitationAddress').val();
    var message = $('#invitationMessage').val();
    
  },
  
  createNumberOfWebSockets : function(number){
    for(var w=0; w < number; w++)
      webRTCSockets.push( new webkitRTCPeerConnection({ "iceServers": [{ "url": "stun:provserver.televolution.net" },{ "url": "stun:stun1.voiceeclipse.net" }] }) );
  },
  
  createNumberOfVideoTags : function(number,ids){
    for(var w=0; w < number; w++){
      App.router.chatroomController.createVideoBox(ids.toString() + w.toString());
    }
  },
  
  createVideoBox: function(id){
    var view = App.BoxView.create();
    view.set('videoBoxId',id);
    view.appendTo('#videoboxes');
  },
  
  addStreamToVideoTag: function(id){
    navigator.getUserMedia({video: true, audio:true}, function(localMediaStream) {      
      $('#'+id).attr('src', webkitURL.createObjectURL(localMediaStream));
    });
  }
  
});