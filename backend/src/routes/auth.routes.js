import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
} from '../controllers/auth.controller.js';

const router = express.Router();

// User register, login and logout
router.post('/user/register', registerUser);
router.post('/user/login', loginUser);
router.get('/user/logout', logoutUser);

// food-partner register, login and logout

export default router;
