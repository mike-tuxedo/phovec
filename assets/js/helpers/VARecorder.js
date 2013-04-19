var VARecorder = {
  
  recorder: null,
  recordedType: null,
  recordedFileLocation: null,
  recording: false,
  
  recordVideo: function(object,recordedType){
    
    if(this.recording){
      this.stopRecording();
    }
    
    if(recordedType === 'video'){
      this.recorder = RecordRTC({
        video: object // video-tag
      });
      this.recorder.recordVideo();
      this.recording = true;
      this.recordedType = recordedType;
    }
    else if(recordedType === 'audio'){
      this.recorder = RecordRTC({
        stream: object // MediaStream or LocalMediaStream
      });
      this.recorder.recordAudio();
      this.recording = true;
      this.recordedType = recordedType;
    }
  },
  
  stopRecording: function(){
    if(this.recordedType === 'video'){
      this.recorder.stopVideo(function(recordedFileURL){
        recordedFileLocation = recordedFileURL;
      });
    }
    else if(this.recordedType === 'audio'){
      this.recorder.stopAudio(function(recordedFileURL) {
         recordedFileLocation = recordedFileURL;
      });
    }
    else{
      console.log('VARecorder stopRecording: attribute recordedType not set')
    }
    this.recording = false;
  },
  
  getRecordedFileViaURL: function(){
    return recordedFileLocation;
  }
  
};