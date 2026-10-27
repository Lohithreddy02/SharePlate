import User from '../models/User.js';
import Donation from '../models/Donation.js';

// @desc    Get system overview metrics & platform health
// @route   GET /api/admin/metrics
// @access  Private (Admin only)
export const getPlatformMetrics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const donorsCount = await User.countDocuments({ role: 'donor' });
    const recipientsCount = await User.countDocuments({ role: 'recipient' });
    const pendingVerificationsCount = await User.countDocuments({
      role: 'recipient',
      'organization.verificationStatus': 'pending'
    });

    const totalDonations = await Donation.countDocuments();
    const availableDonations = await Donation.countDocuments({ status: 'available' });
    const claimedDonations = await Donation.countDocuments({ status: 'claimed' });
    const pickedUpDonations = await Donation.countDocuments({ status: 'picked_up' });
    const completedDonations = await Donation.countDocuments({ status: 'completed' });
    const cancelledDonations = await Donation.countDocuments({ status: 'cancelled' });
    const expiredDonations = await Donation.countDocuments({ status: 'expired' });

    // Aggregate food rescued (completed donations)
    const rescuedAggregation = await Donation.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$unit',
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      metrics: {
        users: {
          total: totalUsers,
          donors: donorsCount,
          recipients: recipientsCount,
          pendingVerifications: pendingVerificationsCount
        },
        donations: {
          total: totalDonations,
          available: availableDonations,
          claimed: claimedDonations,
          pickedUp: pickedUpDonations,
          completed: completedDonations,
          cancelled: cancelledDonations,
          expired: expiredDonations
        },
        rescuedSummary: rescuedAggregation
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all organization verification requests
// @route   GET /api/admin/verifications
// @access  Private (Admin only)
export const getVerificationRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { role: 'recipient' };

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filter['organization.verificationStatus'] = status;
    }

    const organizations = await User.find(filter)
      .select('name email phone address organization createdAt status')
      .populate('organization.verifiedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: organizations.length,
      organizations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject organization verification request
// @route   PATCH /api/admin/verifications/:userId
// @access  Private (Admin only)
export const updateVerificationStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'approved' or 'rejected'."
      });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Organization user not found.'
      });
    }

    if (user.role !== 'recipient') {
      return res.status(400).json({
        success: false,
        message: 'Verification requests only apply to recipient/NGO accounts.'
      });
    }

    user.organization.verificationStatus = status;
    user.organization.verificationNotes = notes || (status === 'approved' ? 'Verified by administrator.' : 'Verification rejected.');
    user.organization.verifiedAt = new Date();
    user.organization.verifiedBy = req.user._id;

    await user.save();

    return res.status(200).json({
      success: true,
      message: `Organization successfully ${status}.`,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with filters & pagination
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const query = {};

    if (role && ['donor', 'recipient', 'admin'].includes(role)) {
      query.role = role;
    }

    if (status && ['active', 'suspended'].includes(status)) {
      query.status = status;
    }

    if (search && search.trim() !== '') {
      const reg = new RegExp(search.trim(), 'i');
      query.$or = [{ name: reg }, { email: reg }, { 'organization.name': reg }];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active/suspended status
// @route   PATCH /api/admin/users/:userId/status
// @access  Private (Admin only)
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Administrators cannot suspend their own account.'
      });
    }

    user.status = user.status === 'active' ? 'suspended' : 'active';
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User account has been ${user.status}.`,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all donation listings with moderation controls
// @route   GET /api/admin/donations
// @access  Private (Admin only)
export const getAllDonations = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;

    if (search && search.trim() !== '') {
      const reg = new RegExp(search.trim(), 'i');
      query.$or = [{ title: reg }, { description: reg }];
    }

    const donations = await Donation.find(query)
      .populate('donor', 'name organization phone email')
      .populate('claimedBy', 'name organization phone email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: donations.length,
      donations
    });
  } catch (error) {
    next(error);
  }
};
