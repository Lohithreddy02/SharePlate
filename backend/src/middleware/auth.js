import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No authorization token was provided.'
      });
    }

    const secret = process.env.JWT_SECRET || 'shareplate_super_secret_jwt_key_2026_production_grade';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by an administrator. Please contact support.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token. Please log in again.'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Authentication server error.'
    });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. You must be authenticated to perform this action.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. This resource requires one of the following roles: [${roles.join(', ')}]. Your current role is '${req.user.role}'.`
      });
    }

    next();
  };
};

export const requireVerifiedRecipient = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Please sign in.'
    });
  }

  if (req.user.role !== 'recipient') {
    return res.status(403).json({
      success: false,
      message: 'Only registered NGO / Food Recipient accounts can claim donations.'
    });
  }

  const verificationStatus = req.user.organization?.verificationStatus;

  if (verificationStatus !== 'approved') {
    return res.status(403).json({
      success: false,
      isVerificationRestricted: true,
      verificationStatus: verificationStatus || 'pending',
      message: `Your organization verification status is '${verificationStatus || 'pending'}'. Only verified organizations can claim food donations.`
    });
  }

  next();
};
