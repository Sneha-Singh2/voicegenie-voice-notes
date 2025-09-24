const VoiceNote = require('../models/VoiceNote');
const genAI = require('../config/gemini');
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
      
      
      const voiceNote = new VoiceNote({
        audioUrl: `data:audio/webm;base64,${req.body.audioData}`,
        transcript: 'Processing transcription...',
        duration: req.body.duration || 0,
        title: `Voice Note - ${new Date().toLocaleString()}`
      });

      await voiceNote.save();
      console.log('Voice note saved successfully:', voiceNote._id);

      
      try {
       
        const tempDir = path.join(__dirname, '..', 'temp');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        
        const tempFileName = `temp-audio-${Date.now()}.webm`;
        const tempFilePath = path.join(tempDir, tempFileName);
        
        
        const audioBuffer = Buffer.from(req.body.audioData, 'base64');
        fs.writeFileSync(tempFilePath, audioBuffer);
        
      
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
        
        const transcript = result.response.text();
        console.log('Transcription result:', transcript);
        
       
        voiceNote.transcript = transcript.trim();
        voiceNote.title = transcript.trim().slice(0, 50) + (transcript.length > 50 ? '...' : '');
        await voiceNote.save();
        
        
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
        
        console.log('Transcription updated successfully');
        
      } catch (transcriptionError) {
        console.error('Transcription failed:', transcriptionError);
        
        
        voiceNote.transcript = 'Transcription not available. Click Edit to add manually.';
        voiceNote.title = `Voice Note - ${new Date().toLocaleString()}`;
        await voiceNote.save();
      }
      
      return res.status(201).json({
        success: true,
        data: voiceNote,
        message: 'Voice note created successfully!'
      });
      
    } else if (req.file) {
      console.log('Processing uploaded file:', req.file.originalname);
      
      const voiceNote = new VoiceNote({
        audioUrl: `/uploads/${req.file.filename}`,
        transcript: 'File transcription will be processed',
        duration: 0,
        title: `Voice Note - ${new Date().toLocaleString()}`
      });

      await voiceNote.save();
      console.log('Voice note saved successfully:', voiceNote._id);
      
      return res.status(201).json({
        success: true,
        data: voiceNote,
        message: 'Voice note created successfully!'
      });
      
    } else {
      console.log('No audio data provided');
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
