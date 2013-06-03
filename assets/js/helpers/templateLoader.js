/* Templates */
$.ajax({url: 'assets/templates/index_template.html', success: function(data){addTemplate(data, 'index');}, async: false });
$.ajax({url: 'assets/templates/about_template.html', success: function(data){addTemplate(data, 'about');}, async: false });
$.ajax({url: 'assets/templates/error_template.html', success: function(data){addTemplate(data, 'error');}, async: false });
$.ajax({url: 'assets/templates/room_template.html', success: function(data){addTemplate(data, 'room');}, async: false });
$.ajax({url: 'assets/templates/room-full_template.html', success: function(data){addTemplate(data, 'room-full');}, async: false });
$.ajax({url: 'assets/templates/rooms_template.html', success: function(data){addTemplate(data, 'rooms');}, async: false });
$.ajax({url: 'assets/templates/room-unknown_template.html', success: function(data){addTemplate(data, 'room-unknown');}, async: false });
$.ajax({url: 'assets/templates/room-hangup_template.html', success: function(data){addTemplate(data, 'room-hangup');}, async: false });

/* Partials */
$.ajax({url: 'assets/templates/_localUser_template.html', success: function(data){addTemplate(data, '_localUser');}, async: false });
$.ajax({url: 'assets/templates/_auth_template.html', success: function(data){addTemplate(data, '_auth');}, async: false });


function addTemplate(data, name){
  Ember.TEMPLATES[name] = Ember.Handlebars.compile(data);
}
