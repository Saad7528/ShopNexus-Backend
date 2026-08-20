import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      console.warn('⚠️ [MongoDB Warning]: MONGO_URI is not defined in .env environment file.');
      return;
    }

    const conn = await mongoose.connect(mongoURI);
    console.log(`🚀 [MongoDB Atlas Connected]: ${conn.connection.host} | DB: ${conn.connection.name}`);
  } catch (error: any) {
    console.error(`❌ [MongoDB Atlas Connection Error]: ${error.message}`);
  }
};
