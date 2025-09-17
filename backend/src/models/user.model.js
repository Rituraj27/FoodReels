import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: 'https://via.placeholder.com/150',
    },
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodPartner',
      },
    ],
    likedReels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodFeed',
      },
    ],
    savedReels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodFeed',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model('User', userSchema);
