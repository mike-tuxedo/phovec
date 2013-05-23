$.ajax({url: 'assets/templates/index_template.html', success: function(data){addTemplate(data, 'index');}, async: false });
$.ajax({url: 'assets/templates/about_template.html', success: function(data){addTemplate(data, 'about');}, async: false });

function addTemplate(data, name){
  Ember.TEMPLATES[name] = Ember.Handlebars.compile(data);
}
