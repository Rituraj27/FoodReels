import { FoodPartner } from '../models/foodPartner.model.js';
import { FoodFeed } from '../models/foodFeeds.model.js';
import { uploadFile } from '../services/storage.service.js';
import { User } from '../models/user.model.js';

// Get authenticated food partner profile with stats
const getProfile = async (req, res) => {
  try {
    const partner = req.foodPartner;
    if (!partner) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Basic profile fields
    // Populate followers with basic user info
    const populatedPartner = await FoodPartner.findById(partner._id).populate({
      path: 'followers',
      select: 'fullName avatar',
    });

    const profile = {
      _id: partner._id,
      businessName: partner.businessName,
      owner: partner.owner,
      businessEmail: partner.businessEmail,
      phoneNumber: partner.phoneNumber,
      address: `${partner.address.street}, ${partner.address.city}, ${partner.address.state} - ${partner.address.pincode}`,
      profileImage: partner.profileImage,
      coverImage: partner.coverImage,
      businessDescription: partner.businessDescription,
      specialties: partner.specialties || [],
      cuisineTypes: partner.cuisineTypes || [],
      followers: (populatedPartner && populatedPartner.followers) || [],
      rating: partner.rating || 0,
      isVerified: partner.isVerified || false,
    };

    // Aggregate stats from FoodFeed
    const totalVideos = await FoodFeed.countDocuments({ owner: partner._id });
    const feeds = await FoodFeed.find({ owner: partner._id })
      .sort({ createdAt: -1 })
      .limit(6)
      .select('title thumbnail likes createdAt videoUrl');

    const totalLikesAgg = await FoodFeed.aggregate([
      { $match: { owner: partner._id } },
      { $group: { _id: null, totalLikes: { $sum: '$likes' } } },
    ]);

    const totalLikes = (totalLikesAgg[0] && totalLikesAgg[0].totalLikes) || 0;

    return res.status(200).json({
      ...profile,
      totalVideos,
      totalLikes,
      recentUploads: feeds,
    });
  } catch (error) {
    console.error('Error fetching food partner profile', error);
    return res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

// Update profile (allow updating description, specialties and images)
const updateProfile = async (req, res) => {
  try {
    const partner = req.foodPartner;
    if (!partner) return res.status(401).json({ message: 'Unauthorized' });

    const updates = {};
    if (req.body.businessDescription !== undefined)
      updates.businessDescription = req.body.businessDescription;
    if (req.body.specialties) {
      try {
        updates.specialties = JSON.parse(req.body.specialties);
      } catch (e) {
        updates.specialties = req.body.specialties
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    // Handle file uploads (profileImage and coverImage)
    if (req.files) {
      if (req.files.profileImage && req.files.profileImage[0]) {
        const file = req.files.profileImage[0];
        const result = await uploadFile(
          file.buffer,
          `profile_${partner._id}`,
          file.mimetype
        );
        updates.profileImage = result.url;
      }
      if (req.files.coverImage && req.files.coverImage[0]) {
        const file = req.files.coverImage[0];
        const result = await uploadFile(
          file.buffer,
          `cover_${partner._id}`,
          file.mimetype
        );
        updates.coverImage = result.url;
      }
    }

    const updated = await FoodPartner.findByIdAndUpdate(
      partner._id,
      { $set: updates },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: 'Profile updated', profile: updated });
  } catch (error) {
    console.error('Error updating profile', error);
    return res.status(500).json({ message: 'Failed to update profile' });
  }
};

export { getProfile, updateProfile };

// Public profile by partner id (no auth)
const getPublicProfile = async (req, res) => {
  try {
    const { partnerId } = req.params;
    if (!partnerId) {
      return res.status(400).json({ message: 'partnerId is required' });
    }

    const partner = await FoodPartner.findById(partnerId).populate({
      path: 'followers',
      select: 'fullName avatar',
    });

    if (!partner) {
      return res.status(404).json({ message: 'Food partner not found' });
    }

    const totalVideos = await FoodFeed.countDocuments({ owner: partner._id });
    const totalLikesAgg = await FoodFeed.aggregate([
      { $match: { owner: partner._id } },
      { $group: { _id: null, totalLikes: { $sum: '$likes' } } },
    ]);
    const totalLikes = (totalLikesAgg[0] && totalLikesAgg[0].totalLikes) || 0;

    const profile = {
      _id: partner._id,
      businessName: partner.businessName,
      owner: partner.owner,
      businessEmail: partner.businessEmail,
      phoneNumber: partner.phoneNumber,
      address: partner.address,
      profileImage: partner.profileImage,
      businessDescription: partner.businessDescription,
      specialties: partner.specialties || [],
      followers: partner.followers || [],
      rating: partner.rating || 0,
      isVerified: partner.isVerified || false,
      totalVideos,
      totalLikes,
    };

    return res.status(200).json({ profile });
  } catch (error) {
    console.error('Error fetching public partner profile', error);
    return res.status(500).json({ message: 'Failed to fetch public profile' });
  }
};

export { getPublicProfile };

// Toggle follow/unfollow by authenticated user
const toggleFollow = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { partnerId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!partnerId) {
      return res.status(400).json({ message: 'partnerId is required' });
    }

    const partner = await FoodPartner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: 'Food partner not found' });
    }

    const isFollowing = partner.followers.some(
      (followerId) => followerId.toString() === userId.toString()
    );

    if (isFollowing) {
      await FoodPartner.findByIdAndUpdate(partnerId, {
        $pull: { followers: userId },
      });
    } else {
      await FoodPartner.findByIdAndUpdate(partnerId, {
        $addToSet: { followers: userId },
      });
    }

    const updated = await FoodPartner.findById(partnerId).select('followers');
    return res.status(200).json({
      message: isFollowing ? 'Unfollowed' : 'Followed',
      isFollowing: !isFollowing,
      followersCount: updated.followers.length,
    });
  } catch (error) {
    console.error('Error toggling follow', error);
    return res.status(500).json({ message: 'Failed to toggle follow' });
  }
};

export { toggleFollow };
