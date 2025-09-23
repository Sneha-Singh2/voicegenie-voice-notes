const VoiceNote = require('../models/VoiceNote');
const genAI = require('../config/gemini');
const { GoogleAIFileManager } = require('@google/generative-ai/server');
const fs = require('fs');
const path = require('path');

const createVoiceNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    console.log('Uploaded file:', req.file);
    
    try {
      
      const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
      
      
      console.log('Uploading file to Gemini...');
      const uploadResult = await fileManager.uploadFile(req.file.path, {
        mimeType: req.file.mimetype,
        displayName: req.file.originalname
      });
      
      console.log('File uploaded:', uploadResult);
      
     
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      
      console.log('Transcribing audio...');
      const result = await model.generateContent([
        "Please transcribe this audio file accurately. Provide only the transcribed text without any additional commentary.",
        {
          fileData: {
            fileUri: uploadResult.file.uri,
            mimeType: uploadResult.file.mimeType
          }
        }
      ]);
      
      const transcript = result.response.text();
      console.log('Transcription result:', transcript);
      
      const voiceNote = new VoiceNote({
        audioUrl: `/uploads/${req.file.filename}`,
        transcript: transcript.trim(),
        duration: 0,
        title: transcript.trim().slice(0, 50) + (transcript.length > 50 ? '...' : '')
      });

      await voiceNote.save();
      
      
      try {
        await fileManager.deleteFile(uploadResult.file.name);
      } catch (cleanupError) {
        console.warn('Failed to cleanup uploaded file from Gemini:', cleanupError);
      }

      res.status(201).json({
        success: true,
        data: voiceNote,
        message: 'Voice note created and transcribed successfully!'
      });

    } catch (transcriptionError) {
      console.error('Transcription error:', transcriptionError);
      
      
      const voiceNote = new VoiceNote({
        audioUrl: `/uploads/${req.file.filename}`,
        transcript: 'Automatic transcription failed. Please edit this manually.',
        duration: 0,
        title: `Voice Note - ${new Date().toLocaleString()}`
      });

      await voiceNote.save();

      res.status(201).json({
        success: true,
        data: voiceNote,
        message: 'Voice note created but transcription failed. Please edit transcript manually.',
        warning: 'Automatic transcription not available'
      });
    }

  } catch (error) {
    console.error('Voice note creation error:', error);
    
   
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete uploaded file:', unlinkError);
      }
    }

    res.status(500).json({ 
      error: 'Failed to create voice note',
      details: error.message 
    });
  }
};

const getAllVoiceNotes = async (req, res) => {
  try {
    const voiceNotes = await VoiceNote.find()
      .sort({ createdAt: -1 })
      .select('title transcript summary audioUrl duration hasSummary isEdited createdAt updatedAt');
    
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
    const { transcript, title } = req.body;

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

    
    const audioPath = path.join(__dirname, '..', voiceNote.audioUrl);
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
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
