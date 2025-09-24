import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createVoiceNote = (formData) => {
  return api.post('/api/voice-notes', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getAllVoiceNotes = () => {
  return api.get('/api/voice-notes');
};

export const updateVoiceNote = (id, data) => {
  return api.put(`/api/voice-notes/${id}`, data);
};

export const deleteVoiceNote = (id) => {
  return api.delete(`/api/voice-notes/${id}`);
};

export const generateSummary = (id) => {
  return api.post(`/api/ai/summary/${id}`);
};

export default api;
