import { User } from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { FoodPartner } from '../models/foodPartner.model.js';

// user Register
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: 'All fields are required',
      });
    }

    const isUserAlreadyRegistered = await User.findOne({
      email,
    });

    if (isUserAlreadyRegistered) {
      return res.status(400).json({
        message: 'User already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h',
      }
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.log('Registration Failed', error);
    return res.status(500).json({
      message: 'Internal server Error',
    });
  }
};
// user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'All fields are required',
      });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid credentials',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: 'Invalid credentials',
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h',
      }
    );

    res.cookie('token', token, {
      httpOnly: true,
      same: 'strict',
      secure: false,
      maxAge: 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'Login successfully',
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.log('Login failed', error);
    res.status(500).json({
      message: 'Internal server failed',
    });
  }
};
// user logout
const logoutUser = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'strict',
  });
  res.status(200).json({
    message: 'Logout successfully',
  });
};

// Food partner Registration
const foodPartnerRegistration = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'All fields are required',
      });
    }

    const isAlreadyfoodPartner = await FoodPartner.findOne({ email });

    if (isAlreadyfoodPartner) {
      return res.status(400).json({
        message: 'Food partner is already Registered',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const foodPartnerUser = await FoodPartner.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        _id: foodPartnerUser._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h',
      }
    );

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
      secure: false,
      sameSite: 'strict',
    });

    res.status(201).json({
      message: 'Registered successfully ✅',
      foodPartnerUser: {
        _id: foodPartnerUser._id,
        name: foodPartnerUser.name,
        email: foodPartnerUser.email,
      },
    });
  } catch (error) {
    console.log('Registration failed 🚫', error);
    res.status(500).json({
      message: 'Registration failed 🚫',
    });
  }
};

// Food partner Login
const foodPartnerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'All fieds are required' });
    }

    const foodPartnerUser = await FoodPartner.findOne({ email });

    if (!foodPartnerUser) {
      return res.status(400).json({
        message: 'Invalid credentials',
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      foodPartnerUser.password
    );

    if (!isPasswordValid) {
      return res.status(400).json({
        message: 'Invalid credentials',
      });
    }

    const token = jwt.sign(
      {
        _id: foodPartnerUser._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h',
      }
    );

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
      secure: false,
    });

    res.status(200).json({
      message: 'Login successfully ✅',
      foodPartnerUser: {
        _id: foodPartnerUser._id,
        email: foodPartnerUser.email,
        name: foodPartnerUser.name,
      },
    });
  } catch (error) {
    console.log('Login failed 🚫', error);
    res.status(500).json({
      message: 'Login failed 🚫',
    });
  }
};

// Food partner Logout
const foodPartnerLogout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    maxAge: 60 * 60 * 1000,
  });
  res.status(200).json({
    message: 'Logout successfully ✅',
  });
};

export {
  registerUser,
  loginUser,
  logoutUser,
  foodPartnerRegistration,
  foodPartnerLogin,
  foodPartnerLogout,
};
