﻿App.UserController = Ember.ObjectController.extend({
  users: [],
  init: function() {
    console.log("init usercontroller");

    var user = App.User.create({
      type: "local"
    });
    this.get("users").push(user);
  },
  setLocalStream: function(stream) {
    var users = this.get("users");
    for (var i = 0; i < users.length; i++) {
      if (users[i].get("type") == "local") {
        return users[i].set("stream", stream);
      }
    }
  },
  getLocalStream: function() {
    var users = this.get("users");
    for (var i = 0; i < users.length; i++) {
      if (users[i].get("type") == "local") {
        return users[i].get("stream");
      }
    }
  },
  onGetMediaSuccess: function(stream) {
    App.Controller.user.setLocalStream(stream);
    window.dispatchEvent(new CustomEvent("localmedia:available"));
    $("#local-stream").attr("src", URL.createObjectURL(stream));
  },
  onGetMediaError: function(error) {
    console.log("LocalMedia: ERROR");
    console.log(error);
  },
  startGetMedia: function() {
    //request audio and video from your own hardware
    navigator.getMedia({
      audio: true,
      video: true
    }, this.onGetMediaSuccess, this.onGetMediaError);
  },
  stopGetMedia: function() {
    //get(0) gets the dom element from the jquery selector
    $("#local-stream").get(0).pause();
    $("#local-stream").attr("src", null);
  }
});
