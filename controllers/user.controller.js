
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { sentToken } from '../utils/jwt.js';
import { catchAsync } from '../middleware/catchAsyn.js';
// import { catchAsync } from '../../server/middleware/catchAsyn.js';
// import { sentToken } from '../../server/utils/jwt.js';

// Create a new user (Register)
export const registerUser =catchAsync( async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if(existingUser){
      return res.status(400).json({
          success:false,
          message:"User already exist"
      })
  }

    // Create a new user
    const newUser = await User.create({ name, email, password });
    await sentToken(newUser,200,res)
    res.status(200).json({
      success:true,
      newUser,
      message:"User created successfully"
  })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }

});

// Login user
export const loginUser = catchAsync( async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if all fields are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Validate password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT Token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',

    });

    res.status(200).json({

      message: 'Login successful',

      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get user profile
export const getUserProfile = async (req, res) => {

  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


//logout user




export const updateAccessToken = catchAsync(async (req, res, next) => {
  try {
    const refresh_token = req.cookies.refreshToken;
    console.log("Refresh Token:", refresh_token);

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        message: "Please login to access this resource.",
      });
    }

    // Decode and handle errors
    let decoded;
    try {
      decoded = jwt.verify(refresh_token, "karankumar");
      console.log(decoded)
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        console.error("JWT Token Expired:", err.message);
        return res.status(401).json({
          success: false,
          message: "Refresh token expired. Please log in again.",
        });
      }

      console.error("JWT Verification Error:", err.message);
      return res.status(400).json({
        success: false,
        message: "Invalid refresh token.",
      });
    }

    if (!decoded || !decoded.id) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired refresh token. Please log in again.",
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Generate new tokens
    const accessToken = jwt.sign({ id: user._id }, "karankumar", { expiresIn: "5m" });
    const newRefreshToken = jwt.sign({ id: user._id }, "karankumar", { expiresIn: "3d" });

    // Set cookies for the new tokens
    res.cookie("accessToken", accessToken, {
      maxAge: 5 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.cookie("refreshToken", newRefreshToken, {
      maxAge: 3 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    console.log("Access Token refreshed:", accessToken);
    res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    console.error("Error in updateAccessToken:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export const getUserInfo = async (req, res, next) => {
  try {

 

    const user=await User.findOne(req.user._id)


  

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
  
    res.status(400).json({ message: 'Server Found' });
  }
}



//logout 
export const logoutUser = catchAsync(async (req, res, next) => {
  try {
    res.cookie("accessToken", "", { maxAge: 0 });
    res.cookie("refreshToken", "", { maxAge: 0 });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Error in logoutUser:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});