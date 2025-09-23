require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const testGemini = async () => {
  try {
    console.log('🔄 Testing Gemini API connection...');
    console.log(' API Key:', process.env.GEMINI_API_KEY ? 'Set ✅' : 'Missing ❌');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const result = await model.generateContent('Say "Gemini working!" in exactly 3 words.');
    console.log('✅ Gemini Response:', result.response.text());
    
    console.log('🎉 Gemini API setup successful - COMPLETELY FREE!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Gemini API Test Failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('API_KEY') || error.message.includes('API key')) {
      console.log('\n🔧 FIX: Add your Gemini API key to .env file');
      console.log('Get it from: https://aistudio.google.com/apikey');
    }
    
    process.exit(1);
  }
};

testGemini();
