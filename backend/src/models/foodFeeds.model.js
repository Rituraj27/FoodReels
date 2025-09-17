import mongoose from 'mongoose';

const foodFeedSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true, // For video preview/loading placeholder
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'appetizer',
        'main-course',
        'dessert',
        'beverage',
        'snack',
        'breakfast',
        'street-food',
      ],
    },
    cuisine: {
      type: String,
      required: true,
      trim: true, // e.g., 'Indian', 'Italian', 'Chinese', etc.
    },
    preparationTime: {
      type: Number,
      required: true, // in minutes
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    ingredients: [
      {
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: String,
          required: true,
        },
      },
    ],
    steps: [
      {
        type: String,
        required: true,
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodPartner',
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    hashtags: [
      {
        type: String,
        trim: true,
      },
    ],
    isVegetarian: {
      type: Boolean,
      default: false,
    },
    nutritionInfo: {
      calories: Number,
      protein: Number,
      carbohydrates: Number,
      fats: Number,
      servingSize: String,
    },
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        text: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const FoodFeed = mongoose.model('FoodFeed', foodFeedSchema);
