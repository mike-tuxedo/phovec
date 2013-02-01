App.StartpageView = Ember.View.extend({
  templateName : 'startpage',
  //contentBinding: 'StartpageController', when a property of StartpageController changes the StartpageView refreshes side
  controller: App.StartpageController
});
