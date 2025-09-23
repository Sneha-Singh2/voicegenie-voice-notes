require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' MongoDB Connected Successfully!');
    console.log('Database Name:', mongoose.connection.name);
    process.exit(0);
  } catch (error) {
    console.error(' MongoDB Connection Failed:', error.message);
    process.exit(1);
  }
};

testConnection();
