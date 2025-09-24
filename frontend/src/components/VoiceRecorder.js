import React, { useState } from 'react';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { createVoiceNote } from '../services/api';
import '../styles/VoiceRecorder.css';

const VoiceRecorder = ({ onNoteCreated }) => {
  const {
    isRecording,
    recordedBlob,
    recordingTime,
    startRecording,
    stopRecording,
    resetRecording,
  } = useVoiceRecorder();

  const [isUploading, setIsUploading] = useState(false);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveNote = async () => {
  if (!recordedBlob) return;

  setIsUploading(true);
  try {
    const formData = new FormData();
    formData.append('audio', recordedBlob, 'recording.webm');
    formData.append('duration', recordingTime);

    console.log(' Saving voice note...');
    const response = await createVoiceNote(formData);
    console.log(' Save response:', response);
    
    
    resetRecording();
    onNoteCreated();
    console.log(' Voice note saved successfully!');
    
  } catch (error) {
    console.error(' Error saving note:', error);
    alert('Failed to save voice note. Please try again.');
  } finally {
    setIsUploading(false);
  }
};


  return (
    <div className="voice-recorder">
      <div className="recorder-header">
        <h2>Voice Notes</h2>
      </div>
      
      <div className="recorder-controls">
        {!recordedBlob ? (
          <button
            className={`record-btn ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isUploading}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
        ) : (
          <div className="playback-controls">
            <audio controls src={URL.createObjectURL(recordedBlob)} />
            <div className="action-buttons">
              <button onClick={resetRecording} className="discard-btn">
                Discard
              </button>
              <button 
                onClick={handleSaveNote} 
                className="save-btn"
                disabled={isUploading}
              >
                {isUploading ? 'Processing...' : 'Save Note'}
              </button>
            </div>
          </div>
        )}
      </div>

      {(isRecording || recordedBlob) && (
        <div className="recording-info">
          <span className="duration">Duration: {formatTime(recordingTime)}</span>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
