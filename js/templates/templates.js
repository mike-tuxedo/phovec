//index template
		
document.write('<script type="text/x-handlebars" data-template-name="index">\
					<header>\
				    	{{#linkTo "about"}}<div id="infoButton"></div>{{/linkTo}}\
				    </header>\
				    <div id="startInfo">\
				    	<h1>Hi! Hier kannst du mit Freunden Videochatten.</h1>\
				    	<p>Einfach auf Start klicken und du bist in einem Chatraum, von wo aus du deine Freunde einladen kannst.</p>\
				    </div>\
				    {{#linkTo "room"}}<div id="startButtonImage"></div>{{/linkTo}}\
				</script>');

//room template
document.write('<script type="text/x-handlebars" data-template-name="room">\
				    <header>\
					    {{#linkTo "about"}}<div id="infoButton"></div>{{/linkTo}}\
					    {{#linkTo "room.hangup"}}<div id="hangupButton">Auflegen</div>{{/linkTo}}\
				    </header>\
            <div id="videoboxes">\
            <div class="user" id="local">\
            <label>Name</label>\
            <video autoplay></video>\
            </div>\
            </div>\
				  </script>');


//about template
document.write('<script type="text/x-handlebars" data-template-name="about">\
				    <header>\
				    {{#linkTo "index"}}<div id="infoButton"></div>{{/linkTo}}\
				    </header>\
				    <div>Das ist ein Projekt, welches im Rahmen des Qualifikationsprojektes 3 an der Fachhochschule Salzburg\
				    im Schwerpunkt Web + Communities realisiert wird. Mit der innovativen Technik WebRTC werden wir den Benützern\
				    dieser Web-Applikation ermöglichen Multi-Video-Konferenzen kostenlos ohne einer Installation von Plugin zuführen.\
				    <br><br>Team<ul><li>Michael Tiefenthaler</li><li>Franz Josef Brünner</li><li>Lukas Wanko</li></ul></div>\
				</script>');
				
//invitation template
document.write('<script type="text/x-handlebars" data-template-name="invitation">\
					<form>\
					<h3>Address</h3>\
					<input type="text" id="invitationAddress" />\
					<h3>Message</h3>\
					<input type="text" id="invitationMessage" />\
					{{#view Ember.Button target="App.router.chatroomController" action="sendInvitation"}}\
					send Invitation\
					{{/view}}\
					</form>\
				</script>');

//box template
document.write('<script type="text/x-handlebars" data-template-name="box">\
					<video {{bindAttr id="view.videoBoxId"}} width="250" height="250" autoplay></video>\
				</script>');
