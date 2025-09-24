import React, { useState } from 'react';
import VoiceRecorder from './components/VoiceRecorder';
import VoiceNotesList from './components/VoiceNotesList';
import './styles/App.css';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleNoteCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="app">
      <VoiceRecorder onNoteCreated={handleNoteCreated} />
      <VoiceNotesList refreshTrigger={refreshTrigger} />
    </div>
  );
}

export default App;
