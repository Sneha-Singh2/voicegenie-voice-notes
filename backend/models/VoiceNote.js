const mongoose = require('mongoose');

const voiceNoteSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'New Voice Note'
  },
  transcript: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    default: null
  },
  audioUrl: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 0
  },
  hasSummary: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

voiceNoteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('VoiceNote', voiceNoteSchema);
