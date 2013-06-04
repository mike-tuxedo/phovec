App.ApplicationView = Ember.View.extend({
  templateName: 'application',
  classNames: ['wrapper'],
  click: function(e){
    var clickedElement = e.target;
    // if user double clicked on his name and clicks outside without pressing enter
    if( App.Controller.room.isNameFormActivated(clickedElement) ){
      $('#videoboxes form#alterNameForm').submit()
    }
  }
});





