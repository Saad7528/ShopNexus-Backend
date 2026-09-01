import mongoose from 'mongoose';
import dns from 'dns';

// Fix ISP DNS SRV resolution issues for MongoDB Atlas (+srv://) across team members
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (_e) {
  // Ignore in environments where setServers is restricted
}

let cachedPromise: Promise<typeof mongoose> | null = null;

export const connectDB = async (): Promise<typeof mongoose | null> => {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.warn('⚠️ [MongoDB Warning]: MONGO_URI is not defined in environment variables.');
    return null;
  }

  if (!cachedPromise) {
    cachedPromise = mongoose
      .connect(mongoURI, {
        serverSelectionTimeoutMS: 10000,
      })
      .then((m) => {
        console.log(`🚀 [MongoDB Atlas Connected]: ${m.connection.host} | DB: ${m.connection.name}`);
        return m;
      })
      .catch((err) => {
        cachedPromise = null;
        console.error(`❌ [MongoDB Atlas Connection Error]: ${err.message}`);
        throw err;
      });
  }

  return cachedPromise;
};
