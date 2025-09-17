import express from 'express';
import multer from 'multer';
import {
  getProfile,
  updateProfile,
  getPublicProfile,
  toggleFollow,
} from '../controllers/foodPartner.controller.js';
import { authFoodPartnerMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// GET /api/foodpartner/profile (protected)
router.get('/profile', authFoodPartnerMiddleware, getProfile);

// PUT /api/foodpartner/profile - update profile and images
const upload = multer({ storage: multer.memoryStorage() });
router.put(
  '/profile',
  authFoodPartnerMiddleware,
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  updateProfile
);

// Public food partner profile
router.get('/public/:partnerId', getPublicProfile);

// Follow/unfollow a partner (user auth required)
import { authUserMiddleware } from '../middlewares/auth.middleware.js';
router.post('/public/:partnerId/follow', authUserMiddleware, toggleFollow);

export default router;
