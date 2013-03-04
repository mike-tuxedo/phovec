describe("when the test starts", function() {
  var str = 'hello world';
  
  it('should check hello world', function(){
    expect(str).toEqual('hello world');
  });
});

describe("when app shows startpage", function() {
  beforeEach(function() {
    var App = Ember.Application.create({
      ready: function(){
        console.log('App is ready!');
      }
    });
    App.initialize();
    
  });
  
  it("should have an indexController", function(){
    expect(indexController).not.toBeUndefined();
  });
});
