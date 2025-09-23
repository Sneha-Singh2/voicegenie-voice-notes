const express = require('express');
const router = express.Router();
const { generateSummary } = require('../controllers/aiController');


router.post('/summary/:id', generateSummary);

module.exports = router;
