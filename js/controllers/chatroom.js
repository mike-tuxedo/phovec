App.ChatroomController = Ember.Controller.extend({
  chatroom: null,
  createChatroom : function(){
    
    // 1-TODO: query to database to be sure that the chatroom has got unique id
    
    var chatroom = App.Chatroom.create();
    chatroom.set('id', (Math.random() * 10000));
    chatroom.set('url', (location.href + '/' + chatroom.get('id')) );
    this.set('chatroom', chatroom);
    
    location.href = location.href.replace('#', '#/chatroom/' + chatroom.get('id'));
    // 3-TODO: post request to database to register new chatroom
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