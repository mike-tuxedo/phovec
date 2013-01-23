App.ChatroomController = Ember.Controller.extend({

  chatroomEntered :false,
  
  sendInitMessagesToServer: function(){
  
    setTimeout(
      function(){
        clientWebSocket.send(JSON.stringify({ init: true, url: location.href })); // inform server whether you are host or guest of chatroom
      },
      500
    );
    
  },
  
  showInvitationForm: function(){
    var view = App.InvitationView.create();
    view.appendTo('#messageBox');
  },
  
  sendInvitation: function(){
    
    // TODO: implement mail module, be careful to send url of chatroom as well
    var address = $('#invitationAddress').val();
    var message = $('#invitationMessage').val();
    
    console.log(address + ' '+message);
    
  }
  
});