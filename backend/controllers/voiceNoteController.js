const VoiceNote = require('../models/VoiceNote');
const genAI = require('../config/gemini');
const { GoogleAIFileManager } = require('@google/generative-ai/server');
const fs = require('fs');
const path = require('path');

const createVoiceNote = async (req, res) => {
  try {
    // Handle both file upload and base64 audio data
    if (req.file) {
      // File upload case - keep your original file upload logic here
      console.log('Uploaded file:', req.file);
      
      // For now, create a simple voice note for file uploads
      const voiceNote = new VoiceNote({
        audioUrl: `/uploads/${req.file.filename}`,
        transcript: 'Transcription will be added here',
        duration: 0,
        title: `Voice Note - ${new Date().toLocaleString()}`
      });

      await voiceNote.save();
      
      return res.status(201).json({
        success: true,
        data: voiceNote,
        message: 'Voice note created successfully!'
      });
      
    } else if (req.body.audioData) {
      // Base64 audio data case (used by your frontend)
      console.log('Received base64 audio data, length:', req.body.audioData.length);
      
      const voiceNote = new VoiceNote({
        audioUrl: `data:audio/webm;base64,${req.body.audioData}`,
        transcript: 'Transcription will be added here',
        duration: req.body.duration || 0,
        title: `Voice Note - ${new Date().toLocaleString()}`
      });

      await voiceNote.save();
      
      return res.status(201).json({
        success: true,
        data: voiceNote,
        message: 'Voice note created successfully!'
      });
      
    } else {
      return res.status(400).json({ 
        error: 'No audio data provided',
        details: 'Either upload a file or provide audioData in request body'
      });
    }
    
  } catch (error) {
    console.error('Voice note creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create voice note',
      details: error.message 
    });
  }
};



module.exports = {
  createVoiceNote,
  getAllVoiceNotes,
  updateVoiceNote,
  deleteVoiceNote
};
