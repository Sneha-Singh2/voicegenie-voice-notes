const VoiceNote = require('../models/VoiceNote');
const genAI = require('../config/gemini');
const { GoogleAIFileManager } = require('@google/generative-ai/server');
const fs = require('fs');
const path = require('path');

const createVoiceNote = async (req, res) => {
  try {
    console.log('Request received:', {
      hasFile: !!req.file,
      hasAudioData: !!req.body.audioData,
      bodyKeys: Object.keys(req.body)
    });

    if (req.body.audioData) {
      console.log('Processing base64 audio data, length:', req.body.audioData.length);
      
      // Create voice note first
      const voiceNote = new VoiceNote({
        audioUrl: `data:audio/webm;base64,${req.body.audioData}`,
        transcript: 'Transcribing audio...',
        duration: req.body.duration || 0,
        title: `Voice Note - ${new Date().toLocaleString()}`
      });

      await voiceNote.save();
      console.log('Voice note saved successfully:', voiceNote._id);

      // Try Gemini transcription in background
      setImmediate(async () => {
        try {
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
          
          const result = await model.generateContent([
            "Please transcribe this audio file accurately. Provide only the transcribed text without any additional commentary.",
            {
              inlineData: {
                data: req.body.audioData,
                mimeType: "audio/webm"
              }
            }
          ]);
          
          const transcript = result.response.text().trim();
          console.log('Transcription successful:', transcript);
          
          // Update the voice note with transcription
          voiceNote.transcript = transcript;
          voiceNote.title = transcript.slice(0, 50) + (transcript.length > 50 ? '...' : '');
          await voiceNote.save();
          
        } catch (transcriptionError) {
          console.error('Background transcription failed:', transcriptionError);
          
          // Update with fallback
          voiceNote.transcript = 'Click Edit to add your transcription';
          voiceNote.title = `Voice Note - ${new Date().toLocaleString()}`;
          await voiceNote.save();
        }
      });
      
      return res.status(201).json({
        success: true,
        data: voiceNote,
        message: 'Voice note created successfully!'
      });
      
    } else if (req.file) {
      console.log('Processing uploaded file:', req.file.originalname);
      
      const voiceNote = new VoiceNote({
        audioUrl: `/uploads/${req.file.filename}`,
        transcript: 'Click Edit to add your transcription',
        duration: 0,
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

const getAllVoiceNotes = async (req, res) => {
  try {
    console.log('Fetching all voice notes...');
    const voiceNotes = await VoiceNote.find()
      .sort({ createdAt: -1 })
      .select('title transcript summary audioUrl duration hasSummary isEdited createdAt updatedAt');
    
    console.log(`Found ${voiceNotes.length} voice notes`);
    
    res.json({
      success: true,
      count: voiceNotes.length,
      data: voiceNotes
    });
  } catch (error) {
    console.error('Get voice notes error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch voice notes',
      details: error.message 
    });
  }
};

const updateVoiceNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { transcript, title, summary, hasSummary } = req.body;

    const voiceNote = await VoiceNote.findById(id);
    if (!voiceNote) {
      return res.status(404).json({ error: 'Voice note not found' });
    }

    if (transcript !== undefined) {
      voiceNote.transcript = transcript;
      voiceNote.isEdited = true;
    }
    
    if (title !== undefined) {
      voiceNote.title = title;
    }

    // Handle summary clearing
    if (summary !== undefined) {
      voiceNote.summary = summary;
    }

    if (hasSummary !== undefined) {
      voiceNote.hasSummary = hasSummary;
    }

    await voiceNote.save();

    res.json({
      success: true,
      data: voiceNote,
      message: 'Voice note updated successfully!'
    });

  } catch (error) {
    console.error('Update voice note error:', error);
    res.status(500).json({ 
      error: 'Failed to update voice note',
      details: error.message 
    });
  }
};


const deleteVoiceNote = async (req, res) => {
  try {
    const { id } = req.params;
    
    const voiceNote = await VoiceNote.findById(id);
    if (!voiceNote) {
      return res.status(404).json({ error: 'Voice note not found' });
    }

    await VoiceNote.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Voice note deleted successfully!'
    });

  } catch (error) {
    console.error('Delete voice note error:', error);
    res.status(500).json({ 
      error: 'Failed to delete voice note',
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
