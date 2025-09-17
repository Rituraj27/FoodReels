import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  foodPartnerRegistration,
  foodPartnerLogin,
  foodPartnerLogout,
} from '../controllers/auth.controller.js';

const router = express.Router();

// User register, login and logout
router.post('/user/register', registerUser);
router.post('/user/login', loginUser);
router.get('/user/logout', logoutUser);

// food-partner register, login and logout
router.post('/food-partner/register', foodPartnerRegistration);
router.post('/food-partner/login', foodPartnerLogin);
router.get('/food-partner/logout', foodPartnerLogout);

export default router;
