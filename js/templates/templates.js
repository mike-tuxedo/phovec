document.write('<script type="text/x-handlebars" data-template-name="box"><video {{bindAttr id="view.videoBoxId"}} width="250" height="250" autoplay></video></script>');
document.write('<script type="text/x-handlebars" data-template-name="index"> \
	    <header> \
	    {{#linkTo "about"}}<div id="infoButton"></div>{{/linkTo}} \
	    </header> \
	    <div id="startInfo"> \
	    <h1>Hi! Hier kannst du mit Freunden Videochatten.</h1> \
	    <p>Einfach auf Start klicken und du bist in einem Chatraum, von wo aus du deine Freunde einladen kannst.</p> \
	    </div> \
	    {{#linkTo "room"}}<div id="startButtonImage"></div>{{/linkTo}} \
	  </script>');