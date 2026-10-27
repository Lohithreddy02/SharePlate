import Donation from '../models/Donation.js';

// Helper to sweep and mark expired donations in background/query
const sweepExpiredDonations = async () => {
  try {
    const now = new Date();
    await Donation.updateMany(
      {
        status: 'available',
        safeCollectionDeadline: { $lte: now }
      },
      {
        $set: { status: 'expired' },
        $push: {
          statusHistory: {
            status: 'expired',
            changedBy: null, // System event
            changedAt: now,
            note: 'Automatically marked expired after collection deadline passed'
          }
        }
      }
    );
  } catch (err) {
    console.error('Error sweeping expired donations:', err.message);
  }
};

// @desc    Get all available donations for public feed / recipients
// @route   GET /api/donations
// @access  Public
export const getAvailableDonations = async (req, res, next) => {
  try {
    await sweepExpiredDonations();

    const { category, search, minQuantity, maxQuantity, dietaryType, sort } = req.query;
    const now = new Date();

    const query = {
      status: 'available',
      safeCollectionDeadline: { $gt: now }
    };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (dietaryType && dietaryType !== 'All') {
      query.dietaryType = dietaryType;
    }

    if (minQuantity || maxQuantity) {
      query.quantity = {};
      if (minQuantity) query.quantity.$gte = Number(minQuantity);
      if (maxQuantity) query.quantity.$lte = Number(maxQuantity);
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { 'pickupAddress.city': searchRegex },
        { 'pickupAddress.street': searchRegex }
      ];
    }

    let sortOptions = { safeCollectionDeadline: 1 }; // Most urgent first by default
    if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    } else if (sort === 'quantity_desc') {
      sortOptions = { quantity: -1 };
    }

    const donations = await Donation.find(query)
      .populate('donor', 'name organization phone email')
      .sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: donations.length,
      donations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single donation by ID
// @route   GET /api/donations/:id
// @access  Public
export const getDonationById = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name organization phone email address')
      .populate('claimedBy', 'name organization phone email')
      .populate('statusHistory.changedBy', 'name role organization');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation listing not found.'
      });
    }

    // Auto-check expiry on fetch
    if (donation.status === 'available' && new Date(donation.safeCollectionDeadline) <= new Date()) {
      donation.status = 'expired';
      donation.statusHistory.push({
        status: 'expired',
        changedBy: donation.donor._id,
        changedAt: new Date(),
        note: 'Expired safe collection window'
      });
      await donation.save();
    }

    return res.status(200).json({
      success: true,
      donation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get donations published by logged-in donor
// @route   GET /api/donations/my-donations
// @access  Private (Donor, Admin)
export const getMyDonations = async (req, res, next) => {
  try {
    await sweepExpiredDonations();

    const donations = await Donation.find({ donor: req.user._id })
      .populate('claimedBy', 'name organization phone email')
      .sort({ createdAt: -1 });

    const stats = {
      total: donations.length,
      available: donations.filter((d) => d.status === 'available').length,
      claimed: donations.filter((d) => d.status === 'claimed').length,
      picked_up: donations.filter((d) => d.status === 'picked_up').length,
      completed: donations.filter((d) => d.status === 'completed').length,
      expiredOrCancelled: donations.filter((d) => ['expired', 'cancelled'].includes(d.status)).length
    };

    return res.status(200).json({
      success: true,
      stats,
      donations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get donations claimed by logged-in recipient
// @route   GET /api/donations/my-claims
// @access  Private (Recipient, Admin)
export const getMyClaims = async (req, res, next) => {
  try {
    const claims = await Donation.find({ claimedBy: req.user._id })
      .populate('donor', 'name organization phone email address')
      .sort({ updatedAt: -1 });

    const stats = {
      total: claims.length,
      activeClaims: claims.filter((c) => c.status === 'claimed').length,
      pickedUp: claims.filter((c) => c.status === 'picked_up').length,
      completed: claims.filter((c) => c.status === 'completed').length
    };

    return res.status(200).json({
      success: true,
      stats,
      claims
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new surplus food donation listing
// @route   POST /api/donations
// @access  Private (Donor, Admin)
export const createDonation = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      quantity,
      unit,
      preparationTime,
      safeCollectionDeadline,
      pickupWindow,
      pickupAddress,
      allergens,
      dietaryType,
      storageCondition,
      imageUrl
    } = req.body;

    // Validation
    if (!title || !description || !category || quantity === undefined || quantity === null || quantity === '' || !unit) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, quantity, and unit are required.'
      });
    }

    if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number greater than 0.'
      });
    }

    if (!preparationTime || !safeCollectionDeadline || !pickupWindow?.start || !pickupWindow?.end) {
      return res.status(400).json({
        success: false,
        message: 'Preparation time, safe collection deadline, and complete pickup window are required.'
      });
    }

    if (!pickupAddress?.street || !pickupAddress?.city || !pickupAddress?.contactPhone) {
      return res.status(400).json({
        success: false,
        message: 'Pickup address (street, city, contact phone) is required.'
      });
    }

    const prepDate = new Date(preparationTime);
    const deadlineDate = new Date(safeCollectionDeadline);
    const windowStart = new Date(pickupWindow.start);
    const windowEnd = new Date(pickupWindow.end);
    const now = new Date();

    if (isNaN(deadlineDate.getTime()) || deadlineDate <= now) {
      return res.status(400).json({
        success: false,
        message: 'Safe collection deadline must be a valid future date and time.'
      });
    }

    if (windowEnd <= windowStart) {
      return res.status(400).json({
        success: false,
        message: 'Pickup window end time must be after the start time.'
      });
    }

    if (windowEnd > deadlineDate) {
      return res.status(400).json({
        success: false,
        message: 'Pickup window end time cannot exceed the safe collection deadline.'
      });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number greater than 0.'
      });
    }

    const newDonation = await Donation.create({
      donor: req.user._id,
      title: title.trim(),
      description: description.trim(),
      category,
      quantity: Number(quantity),
      unit,
      preparationTime: prepDate,
      safeCollectionDeadline: deadlineDate,
      pickupWindow: {
        start: windowStart,
        end: windowEnd
      },
      pickupAddress: {
        street: pickupAddress.street.trim(),
        city: pickupAddress.city.trim(),
        landmark: pickupAddress.landmark?.trim() || '',
        contactPhone: pickupAddress.contactPhone.trim()
      },
      allergens: Array.isArray(allergens) ? allergens : [],
      dietaryType: dietaryType || 'Vegetarian',
      storageCondition: storageCondition || 'Room Temperature',
      imageUrl: imageUrl?.trim() || '',
      status: 'available',
      statusHistory: [
        {
          status: 'available',
          changedBy: req.user._id,
          changedAt: now,
          note: 'Donation listing published and made available'
        }
      ]
    });

    const populated = await Donation.findById(newDonation._id).populate('donor', 'name organization phone email');

    return res.status(201).json({
      success: true,
      message: 'Donation listing created successfully!',
      donation: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an available food donation listing
// @route   PUT /api/donations/:id
// @access  Private (Owner Donor, Admin)
export const updateDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation listing not found.' });
    }

    // Ownership check
    const isOwner = donation.donor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only edit your own donation listings.'
      });
    }

    // Business rule: Can only edit if still available
    if (donation.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: `Cannot edit this donation because its current status is '${donation.status}'. Only 'available' donations can be modified.`
      });
    }

    const {
      title,
      description,
      category,
      quantity,
      unit,
      preparationTime,
      safeCollectionDeadline,
      pickupWindow,
      pickupAddress,
      allergens,
      dietaryType,
      storageCondition,
      imageUrl
    } = req.body;

    if (title) donation.title = title.trim();
    if (description) donation.description = description.trim();
    if (category) donation.category = category;
    if (quantity) donation.quantity = Number(quantity);
    if (unit) donation.unit = unit;
    if (preparationTime) donation.preparationTime = new Date(preparationTime);

    if (safeCollectionDeadline) {
      const deadlineDate = new Date(safeCollectionDeadline);
      if (deadlineDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Safe collection deadline must be in the future.'
        });
      }
      donation.safeCollectionDeadline = deadlineDate;
    }

    if (pickupWindow) {
      if (pickupWindow.start) donation.pickupWindow.start = new Date(pickupWindow.start);
      if (pickupWindow.end) donation.pickupWindow.end = new Date(pickupWindow.end);
      if (donation.pickupWindow.end <= donation.pickupWindow.start) {
        return res.status(400).json({
          success: false,
          message: 'Pickup window end time must be after start time.'
        });
      }
    }

    if (pickupAddress) {
      if (pickupAddress.street) donation.pickupAddress.street = pickupAddress.street.trim();
      if (pickupAddress.city) donation.pickupAddress.city = pickupAddress.city.trim();
      if (pickupAddress.landmark !== undefined) donation.pickupAddress.landmark = pickupAddress.landmark.trim();
      if (pickupAddress.contactPhone) donation.pickupAddress.contactPhone = pickupAddress.contactPhone.trim();
    }

    if (allergens) donation.allergens = Array.isArray(allergens) ? allergens : [];
    if (dietaryType) donation.dietaryType = dietaryType;
    if (storageCondition) donation.storageCondition = storageCondition;
    if (imageUrl !== undefined) donation.imageUrl = imageUrl.trim();

    donation.statusHistory.push({
      status: donation.status,
      changedBy: req.user._id,
      changedAt: new Date(),
      note: 'Donation details updated by owner'
    });

    await donation.save();

    return res.status(200).json({
      success: true,
      message: 'Donation listing updated successfully.',
      donation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Claim an available donation (Atomic Operation with Concurrency Guard)
// @route   POST /api/donations/:id/claim
// @access  Private (Approved NGO / Recipient)
export const claimDonation = async (req, res, next) => {
  try {
    const donationId = req.params.id;
    const now = new Date();

    // Atomic find and update: Checks condition atomically to prevent race conditions
    const updatedDonation = await Donation.findOneAndUpdate(
      {
        _id: donationId,
        status: 'available',
        safeCollectionDeadline: { $gt: now }
      },
      {
        $set: {
          status: 'claimed',
          claimedBy: req.user._id,
          claimedAt: now
        },
        $push: {
          statusHistory: {
            status: 'claimed',
            changedBy: req.user._id,
            changedAt: now,
            note: `Claimed by ${req.user.organization?.name || req.user.name}`
          }
        }
      },
      { new: true }
    )
      .populate('donor', 'name organization phone email address')
      .populate('claimedBy', 'name organization phone email');

    // If update returned null, find out why to give precise feedback
    if (!updatedDonation) {
      const existing = await Donation.findById(donationId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Donation listing not found.'
        });
      }

      if (existing.status === 'claimed') {
        return res.status(409).json({
          success: false,
          message: 'This donation has already been claimed by another organization.'
        });
      }

      if (existing.status === 'picked_up' || existing.status === 'completed') {
        return res.status(409).json({
          success: false,
          message: 'This donation has already been collected or completed.'
        });
      }

      if (existing.status === 'cancelled') {
        return res.status(409).json({
          success: false,
          message: 'This donation was cancelled by the donor.'
        });
      }

      if (new Date(existing.safeCollectionDeadline) <= now || existing.status === 'expired') {
        return res.status(409).json({
          success: false,
          message: 'This donation has expired and can no longer be safely collected.'
        });
      }

      return res.status(409).json({
        success: false,
        message: 'This donation is no longer available to be claimed.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Donation successfully claimed! Please coordinate pickup within the designated window.',
      donation: updatedDonation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark donation as picked up
// @route   POST /api/donations/:id/pickup
// @access  Private (Claiming Recipient, Donor, Admin)
export const markPickedUp = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation listing not found.' });
    }

    const isClaimant = donation.claimedBy?.toString() === req.user._id.toString();
    const isOwner = donation.donor?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isClaimant && !isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only the recipient who claimed this donation or the donor can mark it as picked up.'
      });
    }

    if (donation.status !== 'claimed') {
      return res.status(400).json({
        success: false,
        message: `Cannot mark as picked up. Current status is '${donation.status}'. Only 'claimed' donations can transition to 'picked_up'.`
      });
    }

    const now = new Date();
    donation.status = 'picked_up';
    donation.pickedUpAt = now;
    donation.statusHistory.push({
      status: 'picked_up',
      changedBy: req.user._id,
      changedAt: now,
      note: `Marked as picked up by ${req.user.role === 'recipient' ? (req.user.organization?.name || req.user.name) : 'donor confirmation'}`
    });

    await donation.save();
    const populated = await Donation.findById(donation._id)
      .populate('donor', 'name organization phone email')
      .populate('claimedBy', 'name organization phone email');

    return res.status(200).json({
      success: true,
      message: 'Donation marked as picked up!',
      donation: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark donation as completed / distributed
// @route   POST /api/donations/:id/complete
// @access  Private (Claiming Recipient, Donor, Admin)
export const markCompleted = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation listing not found.' });
    }

    const isClaimant = donation.claimedBy?.toString() === req.user._id.toString();
    const isOwner = donation.donor?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isClaimant && !isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only the recipient who claimed this donation or the donor can mark it completed.'
      });
    }

    if (donation.status !== 'picked_up') {
      return res.status(400).json({
        success: false,
        message: `Cannot complete donation. Current status is '${donation.status}'. Donation must first be 'picked_up' before marking it 'completed'.`
      });
    }

    const now = new Date();
    donation.status = 'completed';
    donation.completedAt = now;
    donation.statusHistory.push({
      status: 'completed',
      changedBy: req.user._id,
      changedAt: now,
      note: `Donation marked as completed/distributed by ${req.user.name}`
    });

    await donation.save();
    const populated = await Donation.findById(donation._id)
      .populate('donor', 'name organization phone email')
      .populate('claimedBy', 'name organization phone email');

    return res.status(200).json({
      success: true,
      message: 'Donation successfully marked as completed! Thank you for rescuing surplus food.',
      donation: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a donation listing
// @route   PATCH /api/donations/:id/cancel
// @access  Private (Donor owner, Admin)
export const cancelDonation = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation listing not found.' });
    }

    const isOwner = donation.donor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only the donor who created this listing or an administrator can cancel it.'
      });
    }

    if (['picked_up', 'completed'].includes(donation.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a donation that is already '${donation.status}'. Food has already been collected.`
      });
    }

    if (donation.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This donation is already cancelled.'
      });
    }

    const now = new Date();
    donation.status = 'cancelled';
    donation.cancelledAt = now;
    donation.cancellationReason = reason?.trim() || 'Cancelled by donor';
    donation.statusHistory.push({
      status: 'cancelled',
      changedBy: req.user._id,
      changedAt: now,
      note: `Cancelled: ${donation.cancellationReason}`
    });

    await donation.save();

    return res.status(200).json({
      success: true,
      message: 'Donation listing has been cancelled.',
      donation
    });
  } catch (error) {
    next(error);
  }
};
