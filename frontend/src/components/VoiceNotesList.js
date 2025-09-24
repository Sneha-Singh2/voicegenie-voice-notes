import React, { useState, useEffect } from 'react';
import { getAllVoiceNotes, deleteVoiceNote } from '../services/api';
import VoiceNoteItem from './VoiceNoteItem';

const VoiceNotesList = ({ refreshTrigger }) => {
  const [voiceNotes, setVoiceNotes] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  fetchVoiceNotes();
}, [refreshTrigger]);

  const fetchVoiceNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(' Fetching voice notes...');
      const response = await getAllVoiceNotes();
      console.log(' API Response:', response);
      
      
      if (response.data && Array.isArray(response.data.data)) {
        setVoiceNotes(response.data.data); 
      } else if (response.data && Array.isArray(response.data)) {
        setVoiceNotes(response.data); 
      } else if (Array.isArray(response)) {
        setVoiceNotes(response); 
      } else {
        console.warn(' Unexpected API response structure:', response);
        setVoiceNotes([]); 
      }
      
    } catch (error) {
      console.error('Error fetching voice notes:', error);
      setError('Failed to load voice notes. Make sure backend is running.');
      setVoiceNotes([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
  const confirmed = window.confirm('Are you sure you want to delete this voice note?');
  if (!confirmed) return;

  try {
    console.log(' Deleting voice note:', id);
    await deleteVoiceNote(id);
    
    
    setVoiceNotes(prev => prev.filter(note => note._id !== id));
    console.log(' Voice note deleted successfully');
    
  } catch (error) {
    console.error(' Error deleting voice note:', error);
    alert('Failed to delete voice note. Please try again.');
    
    fetchVoiceNotes();
  }
};


  const handleUpdate = () => {
    
    fetchVoiceNotes();
  };

  
  if (loading) {
    return (
      <div className="voice-notes-list">
        <h2>Your Voice Notes</h2>
        <p>Loading voice notes...</p>
      </div>
    );
  }

  
  if (error) {
    return (
      <div className="voice-notes-list">
        <h2>Your Voice Notes</h2>
        <div className="error-message">
          <p style={{color: 'red'}}>{error}</p>
          <button onClick={fetchVoiceNotes}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="voice-notes-list">
      <h2>Your Voice Notes</h2>
      
      {voiceNotes.length === 0 ? (
        <div className="empty-state">
          <p>No voice notes yet. Record your first note!</p>
        </div>
      ) : (
        <div className="notes-grid">
          {voiceNotes.map((note) => ( 
            <VoiceNoteItem
              key={note._id}
              note={note}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VoiceNotesList;
