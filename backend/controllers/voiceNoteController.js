const VoiceNote = require('../models/VoiceNote');
const genAI = require('../config/gemini');
const { GoogleAIFileManager } = require('@google/generative-ai/server');
const fs = require('fs');
const path = require('path');

const createVoiceNote = async (req, res) => {
  try {
    
    let audioData;
    let filename;
    
    if (req.file) {
     
      audioData = req.file;
      filename = req.file.filename;
    } else if (req.body.audioData) {
     
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
