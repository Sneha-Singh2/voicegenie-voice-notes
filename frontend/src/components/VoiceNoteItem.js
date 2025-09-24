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
  const [currentTranscript, setCurrentTranscript] = useState(note.transcript);
  const [originalTranscript, setOriginalTranscript] = useState(note.transcript); // Track original transcript

  // Auto-refresh for transcription updates
  useEffect(() => {
    if (note.transcript === 'Transcribing audio...' || note.transcript === 'Processing transcription...') {
      const interval = setInterval(() => {
        onUpdate(); // This will refresh the note data
      }, 3000);

      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 30000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [note.transcript, onUpdate]);

  // Update states when note changes
  useEffect(() => {
    setEditedTranscript(note.transcript);
    setCurrentTranscript(note.transcript);
    setOriginalTranscript(note.transcript);
    setLocalSummary(note.summary || '');
    setHasGeneratedSummary(Boolean(note.summary));
    setSummaryCleared(false);
  }, [note._id, note.transcript, note.summary]);

  const handleEdit = async () => {
    if (isEditing) {
      try {
        const transcriptChanged = editedTranscript !== originalTranscript;
        
        await updateVoiceNote(note._id, { transcript: editedTranscript });
        
        if (transcriptChanged) {
          // Clear summary and reset generate button when transcript is edited
          setLocalSummary('');
          setSummaryCleared(true);
          setHasGeneratedSummary(false);
          
          // Update the note's summary on the backend to clear it
          await updateVoiceNote(note._id, { 
            transcript: editedTranscript,
            summary: null, // Clear the summary
            hasSummary: false // Reset summary flag
          });
        }
        
        setCurrentTranscript(editedTranscript);
        setOriginalTranscript(editedTranscript); // Update original transcript
        setIsEditing(false);
        onUpdate(); // Refresh the list
        
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

  const isTranscriptionPending = currentTranscript === 'Transcribing audio...' || 
                                 currentTranscript === 'Processing transcription...';

  // Check if transcript has been changed from original
  const hasTranscriptChanged = editedTranscript !== originalTranscript;

  return (
    <div className="voice-note-item">
      <div className="note-header">
        <span className="note-date">{formatDate(note.createdAt)}</span>
        {note.duration > 0 && (
          <span className="note-duration">
            {Math.floor(note.duration / 60)}:{(note.duration % 60).toString().padStart(2, '0')}
          </span>
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
          <p className={`transcript ${isTranscriptionPending ? 'transcription-pending' : ''}`}>
            {isTranscriptionPending ? (
              <>
                <span className="loading-indicator">🎤</span>
                {currentTranscript}
              </>
            ) : (
              currentTranscript
            )}
          </p>
        )}
      </div>

      {!summaryCleared && (localSummary || note.summary) && !hasTranscriptChanged && (
        <div className="summary-section">
          <h4>Summary:</h4>
          <p className="summary-text">{localSummary || note.summary}</p>
        </div>
      )}

      <div className="note-actions">
        <button onClick={handleEdit} className="edit-btn" disabled={isTranscriptionPending}>
          {isEditing ? 'Save' : 'Edit'}
        </button>
        <button onClick={handleDelete} className="delete-btn">
          Delete
        </button>
        <button
          onClick={handleGenerateSummary}
          disabled={
            isGeneratingSummary || 
            isTranscriptionPending || 
            (hasGeneratedSummary && !hasTranscriptChanged && !summaryCleared)
          }
          className="summary-btn"
        >
          {isGeneratingSummary ? 'Generating...' : 'Generate Summary'}
        </button>
      </div>
    </div>
  );
};

export default VoiceNoteItem;
