import jwt from 'jsonwebtoken';
import { FoodPartner } from '../models/foodPartner.model.js';
import { User } from '../models/user.model.js';

// verify token

const verifyToken = async (req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    return { error: 'Unauthorized: No token Provided' };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { decoded };
  } catch (error) {
    console.error('JWT verification failed', error.message);
    return { error: 'unauthorized: Invalid or expired token' };
  }
};

// auth food partner
const authFoodPartnerMiddleware = async (req, res, next) => {
  try {
    const { decoded, error } = await verifyToken(req, res);
    if (error) {
      return res.status(401).json({
        message: error,
      });
    }
    const partnerId = decoded?._id || decoded?.id;
    const foodPartner = await FoodPartner.findById(partnerId);

    if (!foodPartner) {
      return res.status(401).json({
        message: 'unauthorized, Partner not found',
      });
    }

    req.foodPartner = foodPartner;

    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

// auth user
const authUserMiddleware = async (req, res, next) => {
  try {
    const { decoded, error } = await verifyToken(req, res);
    if (error) {
      return res.status(401).json({
        message: error,
      });
    }
    const userId = decoded?._id || decoded?.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        message: 'user not found or not authenticated',
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log('Auth error', error);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};
export { authFoodPartnerMiddleware, authUserMiddleware };
