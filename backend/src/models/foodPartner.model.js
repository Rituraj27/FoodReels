import mongoose from 'mongoose';

const foodPartnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
    },
  },
  { timestamps: true }
);

export const FoodPartner = mongoose.model('FoodPartner', foodPartnerSchema);
