import React, { useState, useEffect } from 'react';
import { updateVoiceNote, generateSummary } from '../services/api';
import '../styles/VoiceNoteItem.css';

const VoiceNoteItem = ({ note, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState(note.transcript);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [localSummary, setLocalSummary] = useState(note.summary || '');
  const [hasGeneratedSummary, setHasGeneratedSummary] = useState(Boolean(note.summary));
  const [summaryCleared, setSummaryCleared] = useState(false); 


useEffect(() => {
  setEditedTranscript(note.transcript);
}, [note._id]);



  const handleEdit = async () => {
  if (isEditing) {
    try {
      const transcriptChanged = editedTranscript !== note.transcript;
      
      await updateVoiceNote(note._id, { transcript: editedTranscript });
      
      if (transcriptChanged) {
        setLocalSummary(''); 
        setSummaryCleared(true); 
        setHasGeneratedSummary(false);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating note:', error);
    }
  } else {
    setIsEditing(true);
  }
};



  const handleDelete = () => {
  onDelete(note._id);
};



  const handleGenerateSummary = async () => {
  setIsGeneratingSummary(true);
  try {
    const response = await generateSummary(note._id);
    
    setLocalSummary(response.data.summary);
    setSummaryCleared(false);
    setHasGeneratedSummary(true);
    
    onUpdate();
    
  } catch (error) {
    console.error('Error generating summary:', error);
    alert('Failed to generate summary. Please try again.');
  } finally {
    setIsGeneratingSummary(false);
  }
};



  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="voice-note-item">
      <div className="note-header">
        <span className="note-date">{formatDate(note.createdAt)}</span>
        {note.duration > 0 && (
          <span className="note-duration">{Math.floor(note.duration / 60)}:{(note.duration % 60).toString().padStart(2, '0')}</span>
        )}
      </div>

      <div className="note-content">
        {isEditing ? (
          <textarea
           value={editedTranscript}
           onChange={(e) => setEditedTranscript(e.target.value)}
           className="edit-textarea"
           autoFocus
          />


        ) : (
          <p className="transcript">{editedTranscript}</p>
        )}
      </div>

      {!summaryCleared && (localSummary || note.summary) && (
  <div className="summary-section">
    <h4>Summary:</h4>
    <p className="summary-text">{localSummary || note.summary}</p>
  </div>
)}


      <div className="note-actions">
        <button onClick={handleEdit} className="edit-btn">
          {isEditing ? 'Save' : 'Edit'}
        </button>
        <button onClick={handleDelete} className="delete-btn">
          Delete
        </button>
        <button
         onClick={handleGenerateSummary}
          disabled={isGeneratingSummary || hasGeneratedSummary}
         className="summary-btn"
         >
         {isGeneratingSummary ? 'Generating...' : 'Generate Summary'}
        </button>


      </div>
    </div>
  );
};

export default VoiceNoteItem;
