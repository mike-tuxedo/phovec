var VARecorder = {
  
  recorder: null,
  recordedType: null,
  recordedFileLocation: null,
  recording: false,
  
  recordVideo: function(object,recordedType){
    
    if(VARecorder.recording){
      VARecorder.stopRecording();
    }
    
    VARecorder.recording = true;
    
    if(recordedType === 'video'){
      VARecorder.recorder = RecordRTC({
        video: object // video-tag
      });
      VARecorder.recorder.recordVideo();
      VARecorder.recordedType = recordedType;
    }
    else if(recordedType === 'audio'){
      VARecorder.recorder = RecordRTC({
        stream: object
      });
      VARecorder.recorder.recordAudio();
      VARecorder.recordedType = recordedType;
    }
  },
  
  stopRecording: function(){
    if(VARecorder.recordedType === 'video'){
      VARecorder.recorder.stopVideo(function(recordedFileURL) {
        window.open(recordedFileURL);
      });
    }
    else if(VARecorder.recordedType === 'audio'){
      VARecorder.recorder.stopAudio(function(recordedFileURL) { 
        window.open(recordedFileURL);
      });
    }
    else{
      console.log('VARecorder stopRecording: attribute recordedType not set')
    }
    VARecorder.recording = false;
  }
  
};