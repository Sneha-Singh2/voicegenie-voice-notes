import axios from 'axios';

const API_BASE_URL = 'https://voicegenie-backend.onrender.com';


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createVoiceNote = (audioData) => {
  return api.post('/api/voice-notes', audioData, {
    headers: {
      'Content-Type': 'application/json',  
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
