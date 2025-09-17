import express from 'express';
import {
  createFoodFeed,
  getFoodFeed,
  toggleLikeFoodFeed,
  addComment,
  incrementViews,
} from '../controllers/foodFeed.controller.js';
import multer from 'multer';
import {
  authFoodPartnerMiddleware,
  authUserMiddleware,
} from '../middlewares/auth.middleware.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

// Post /api/food {protected route}
router.post(
  '/create',
  authFoodPartnerMiddleware,
  upload.single('video'),
  createFoodFeed
);

router.get('/', authUserMiddleware, getFoodFeed);

// Public listing for feeds (no auth) - supports query params incl. owner
router.get('/public', getFoodFeed);

// Like/unlike a food feed
router.post('/:feedId/like', authUserMiddleware, toggleLikeFoodFeed);

// Add comment to a food feed
router.post('/:feedId/comment', authUserMiddleware, addComment);

// Increment view count
router.post('/:feedId/view', incrementViews);

export default router;
