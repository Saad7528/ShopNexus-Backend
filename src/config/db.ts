import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      console.warn('⚠️ [MongoDB Warning]: MONGO_URI is not defined in environment variables.');
      return;
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
    });
    isConnected = true;
    console.log(`🚀 [MongoDB Atlas Connected]: ${conn.connection.host} | DB: ${conn.connection.name}`);
  } catch (error: any) {
    console.error(`❌ [MongoDB Atlas Connection Error]: ${error.message}`);
  }
};
