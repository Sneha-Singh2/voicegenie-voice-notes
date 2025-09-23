const genAI = require('../config/gemini');
const VoiceNote = require('../models/VoiceNote');

const generateSummary = async (req, res) => {
  try {
    const { id } = req.params;
    
    
    const voiceNote = await VoiceNote.findById(id);
    if (!voiceNote) {
      return res.status(404).json({ error: 'Voice note not found' });
    }

    if (!voiceNote.transcript || voiceNote.transcript.trim() === '') {
      return res.status(400).json({ error: 'No transcript available to summarize' });
    }

    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `Please provide a concise and clear summary of the following transcript. Focus on the main points and key information:

Transcript: "${voiceNote.transcript}"

Summary:`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    
    voiceNote.summary = summary.trim();
    voiceNote.hasSummary = true;
    await voiceNote.save();

    res.json({
      success: true,
      summary: summary.trim(),
      message: 'Summary generated successfully!'
    });

  } catch (error) {
    console.error('Gemini summarization error:', error);
    res.status(500).json({ 
      error: 'Failed to generate summary with Gemini',
      details: error.message 
    });
  }
};

module.exports = {
  generateSummary
};
