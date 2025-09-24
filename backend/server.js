const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');

const voiceNotesRoutes = require('./routes/voiceNotes');
const aiRoutes = require('./routes/ai');
const errorHandler = require('./middleware/errorHandler');

const app = express();


connectDB();


app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100
});
app.use(limiter);


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.json({ 
    message: 'VoiceGenie API Server is running!',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      voiceNotes: '/api/voice-notes',
      ai: '/api/ai'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Voice Notes API is running',
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});


app.use('/api/voice-notes', voiceNotesRoutes);
app.use('/api/ai', aiRoutes);


app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Using Gemini AI for transcription and summarization`);
});
