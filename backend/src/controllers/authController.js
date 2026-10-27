import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'shareplate_super_secret_jwt_key_2026_production_grade';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: userId }, secret, { expiresIn });
};

// @desc    Register a new user (Donor, NGO / Recipient, or Admin)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, address, organization } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and phone number are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters in length.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const assignedRole = ['donor', 'recipient', 'admin'].includes(role) ? role : 'donor';

    let orgData = {
      name: organization?.name || (assignedRole === 'donor' ? `${name}'s Kitchen` : ''),
      type: organization?.type || (assignedRole === 'recipient' ? 'ngo' : 'restaurant'),
      regNumber: organization?.regNumber || '',
      description: organization?.description || '',
      verificationStatus: assignedRole === 'recipient' ? 'pending' : (assignedRole === 'admin' ? 'approved' : 'not_applicable')
    };

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: assignedRole,
      phone: phone.trim(),
      address: address?.trim() || '',
      organization: orgData
    });

    const token = generateToken(newUser._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: newUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login existing user & return JWT
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by an administrator. Please contact support.'
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & resubmit verification request
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, organization, requestReverification } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (address !== undefined) user.address = address.trim();

    if (organization) {
      if (organization.name) user.organization.name = organization.name.trim();
      if (organization.type) user.organization.type = organization.type;
      if (organization.regNumber !== undefined) user.organization.regNumber = organization.regNumber.trim();
      if (organization.description !== undefined) user.organization.description = organization.description.trim();

      // If an NGO is rejected and requests reverification, set back to pending
      if (user.role === 'recipient' && requestReverification) {
        user.organization.verificationStatus = 'pending';
        user.organization.verificationNotes = 'Re-verification requested by organization on ' + new Date().toISOString();
      }
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user
    });
  } catch (error) {
    next(error);
  }
};
