import { FoodFeed } from '../models/foodFeeds.model.js';
import { User } from '../models/user.model.js';
import { v4 as uuid } from 'uuid';
import { uploadFile } from '../services/storage.service.js';

const createFoodFeed = async (req, res) => {
  try {
    // Check if the request is from a food partner
    if (!req.foodPartner) {
      return res.status(403).json({
        message: 'Only food partners can create reels',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: 'Video file is required',
      });
    }

    const requiredFields = [
      'title',
      'description',
      'category',
      'cuisine',
      'preparationTime',
      'ingredients',
      'steps',
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          message: `${field} is required`,
        });
      }
    }

    // Upload video file (with timeout managed by uploadFile)
    console.log(
      'Starting upload to storage.service for file: ',
      req.file.originalname,
      ' mimetype:',
      req.file.mimetype
    );
    let fileUploadResult;
    try {
      fileUploadResult = await uploadFile(
        req.file.buffer,
        uuid(),
        req.file.mimetype
      );
      console.log(
        'Upload result received from storage.service:',
        fileUploadResult && fileUploadResult.url
      );
    } catch (uploadErr) {
      console.error('Storage upload error:', uploadErr);
      if (uploadErr.code === 'UPLOAD_TIMEOUT') {
        return res
          .status(408)
          .json({ message: 'File upload timed out. Please try again.' });
      }
      if (
        uploadErr.code === 'ENOTFOUND' ||
        uploadErr.code === 'NETWORK_ERROR'
      ) {
        return res.status(502).json({
          message: 'Network/DNS error while contacting storage provider.',
        });
      }
      return res
        .status(500)
        .json({ message: uploadErr.message || 'File upload failed' });
    }

    // Normalize ingredients from frontend { item, quantity } -> schema { name, quantity }
    let normalizedIngredients = [];
    try {
      const parsedIngredients = JSON.parse(req.body.ingredients);
      normalizedIngredients = parsedIngredients.map((ing) => ({
        name: ing.item || ing.name || '',
        quantity: ing.quantity || '',
      }));
    } catch (err) {
      console.warn(
        'Failed to parse/normalize ingredients, using raw body value',
        err.message
      );
      // Fallback: if already an array
      normalizedIngredients = Array.isArray(req.body.ingredients)
        ? req.body.ingredients
        : [];
    }

    // Ensure required upload result fields
    if (!fileUploadResult || !fileUploadResult.url) {
      console.error(
        'No URL returned from storage upload, aborting createFoodFeed'
      );
      return res
        .status(500)
        .json({ message: 'File upload failed, please try again' });
    }

    // Prepare the DB object
    const foodPayload = {
      title: req.body.title,
      description: req.body.description,
      videoUrl: fileUploadResult.url,
      thumbnail: fileUploadResult.url, // Using video URL as thumbnail for now
      category: req.body.category,
      cuisine: req.body.cuisine,
      preparationTime: parseInt(req.body.preparationTime),
      difficulty: req.body.difficulty || 'medium',
      ingredients: normalizedIngredients,
      steps: JSON.parse(req.body.steps),
      owner: req.foodPartner._id,
      isVegetarian: req.body.isVegetarian === 'true',
      hashtags: req.body.hashtags ? JSON.parse(req.body.hashtags) : [],
      nutritionInfo: req.body.nutritionInfo
        ? JSON.parse(req.body.nutritionInfo)
        : undefined,
    };

    // Respond immediately so the client doesn't wait on DB save
    res.status(201).json({
      message: 'File uploaded to storage, saving to database in background',
      url: fileUploadResult.url,
    });

    // Save to DB asynchronously (fire-and-forget). Log errors only.
    (async () => {
      try {
        const saved = await FoodFeed.create(foodPayload);
        await saved.populate('owner', 'businessName profileImage rating');
        console.log('FoodFeed saved in background:', saved._id);
      } catch (bgErr) {
        console.error('Background save of FoodFeed failed:', bgErr);
      }
    })();
  } catch (error) {
    console.error('Food feeds creation failed:', error);
    res.status(500).json({
      message: 'Food feed creation failed',
      error: error.message || 'An unknown error occurred',
    });
  }
};

const getFoodFeed = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      cuisine,
      difficulty,
      isVegetarian,
      sortBy,
      owner,
    } = req.query;

    const query = {};
    if (category) query.category = category;
    if (cuisine) query.cuisine = cuisine;
    if (difficulty) query.difficulty = difficulty;
    if (isVegetarian) query.isVegetarian = isVegetarian === 'true';
    if (owner) query.owner = owner;

    const sortOptions = {};
    if (sortBy === 'latest') sortOptions.createdAt = -1;
    if (sortBy === 'popular') sortOptions.likes = -1;
    if (sortBy === 'views') sortOptions.views = -1;

    const foodFeeds = await FoodFeed.find(query)
      .populate('owner', 'businessName profileImage rating')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await FoodFeed.countDocuments(query);

    res.status(200).json({
      message: 'Food items fetched successfully',
      foodFeeds,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.log('Error in getting Food', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Like or unlike a food feed
const toggleLikeFoodFeed = async (req, res) => {
  try {
    const { feedId } = req.params;
    const userId = req.user._id;

    const foodFeed = await FoodFeed.findById(feedId);
    if (!foodFeed) {
      return res.status(404).json({ message: 'Food feed not found' });
    }

    // Check if user already liked
    const isLiked = await User.findOne({
      _id: userId,
      likedReels: feedId,
    });

    if (isLiked) {
      // Unlike
      await User.findByIdAndUpdate(userId, {
        $pull: { likedReels: feedId },
      });
      foodFeed.likes--;
    } else {
      // Like
      await User.findByIdAndUpdate(userId, {
        $addToSet: { likedReels: feedId },
      });
      foodFeed.likes++;
    }

    await foodFeed.save();

    res.status(200).json({
      message: isLiked ? 'Removed from favorites' : 'Added to favorites',
      likes: foodFeed.likes,
    });
  } catch (error) {
    console.log('Error in toggling like', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Add comment to a food feed
const addComment = async (req, res) => {
  try {
    const { feedId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const foodFeed = await FoodFeed.findById(feedId);
    if (!foodFeed) {
      return res.status(404).json({ message: 'Food feed not found' });
    }

    foodFeed.comments.push({
      user: userId,
      text,
    });

    await foodFeed.save();
    await foodFeed.populate('comments.user', 'fullName avatar');

    res.status(201).json({
      message: 'Comment added successfully',
      comment: foodFeed.comments[foodFeed.comments.length - 1],
    });
  } catch (error) {
    console.log('Error in adding comment', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Increment view count
const incrementViews = async (req, res) => {
  try {
    const { feedId } = req.params;

    const foodFeed = await FoodFeed.findByIdAndUpdate(
      feedId,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!foodFeed) {
      return res.status(404).json({ message: 'Food feed not found' });
    }

    res.status(200).json({
      message: 'View count updated',
      views: foodFeed.views,
    });
  } catch (error) {
    console.log('Error in incrementing views', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export {
  createFoodFeed,
  getFoodFeed,
  toggleLikeFoodFeed,
  addComment,
  incrementViews,
};
