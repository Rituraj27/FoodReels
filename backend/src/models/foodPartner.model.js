import mongoose from 'mongoose';

const foodPartnerSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      street: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      pincode: {
        type: String,
        required: true,
        trim: true,
      },
    },
    businessEmail: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      default: 'https://via.placeholder.com/150',
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/1200x300',
    },
    businessDescription: {
      type: String,
      trim: true,
    },
    businessHours: {
      open: String,
      close: String,
    },
    specialties: [
      {
        type: String,
        trim: true,
      },
    ],
    cuisineTypes: [
      {
        type: String,
        trim: true,
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    socialMedia: {
      instagram: String,
      facebook: String,
      twitter: String,
      youtube: String,
    },
    certificates: [
      {
        name: String,
        imageUrl: String,
        issueDate: Date,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const FoodPartner = mongoose.model('FoodPartner', foodPartnerSchema);
