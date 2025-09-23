const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  createVoiceNote,
  getAllVoiceNotes,
  updateVoiceNote,
  deleteVoiceNote
} = require('../controllers/voiceNoteController');


router.post('/', upload.single('audio'), createVoiceNote);


router.get('/', getAllVoiceNotes);


router.put('/:id', updateVoiceNote);


router.delete('/:id', deleteVoiceNote);

module.exports = router;
