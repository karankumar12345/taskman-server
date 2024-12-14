import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const authenticate = async (req, res, next) => {
  const token=req.cookies.accessToken;

  if(!token){
    return res.status(401).json({
        success: false,
        message: "Please login to access this resource",
    });
}

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET||"karankumar");

    req.user = decoded;
    
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token or user does not exist.' });
    }

    
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};
