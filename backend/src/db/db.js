import mongoose, { mongo } from 'mongoose';
import { DbName } from '../constant.js';

const connectDB = async () => {
  try {
    const instance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DbName}`
    );
    console.log('MongoDB Connected ✅');
  } catch (error) {
    console.log('MongoDb Connection Failed', error);
    process.exit(1);
  }
};

export { connectDB };
