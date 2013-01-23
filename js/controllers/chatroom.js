App.ChatroomController = Ember.Controller.extend({
  chatroom: null,
  createChatroom : function(){
  
    sendInitMessagesToServer();
    
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