import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined');

  mongoose.set('strictQuery', false);

  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Reconnecting...');
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
}
