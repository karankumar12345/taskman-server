import express from 'express';
import { registerUser, loginUser, getUserProfile, getUserInfo, updateAccessToken, logoutUser } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';
// import { authenticate } from '../middleware/authMiddleware.js';

const userrouter = express.Router();

// Register User
userrouter.post('/register', registerUser);

// Login User
userrouter.post('/login', loginUser);

// Get User Profile (Protected Route)
userrouter.get('/profile', authenticate, getUserProfile);
userrouter.get("/me",authenticate, getUserInfo);
userrouter.get("/refreshToken",updateAccessToken)
userrouter.get("/logout", authenticate, logoutUser);
export default userrouter;
