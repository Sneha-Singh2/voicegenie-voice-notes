const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    return res.status(404).json({ error: message });
  }

  
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    return res.status(400).json({ error: message });
  }

 
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({ error: message });
  }


  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File size too large' });
  }

  if (err.message === 'Invalid file type. Only audio files are allowed.') {
    return res.status(400).json({ error: err.message });
  }

  res.status(err.statusCode || 500).json({
    error: err.message || 'Server Error'
  });
};

module.exports = errorHandler;
