describe("room helper methods", function() {
  
  var room = App.RoomController.create();
  
  it('should return true when word matches', function(){
    
    var speakOrder = 'Sprachbefehl Video an';
    
    expect(true).toEqual( room.doesContainWord(speakOrder,'Sprachbefehl') );
    expect(true).toEqual( room.doesContainWord(speakOrder,'Video') );
    expect(true).toEqual( room.doesContainWord(speakOrder,'an') );
    expect(false).toEqual( room.doesContainWord(speakOrder,'aus') );
    
  });
  
});

