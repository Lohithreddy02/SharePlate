import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ['available', 'claimed', 'picked_up', 'completed', 'cancelled', 'expired']
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donor is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Food title is required'],
      trim: true,
      maxlength: [140, 'Title cannot exceed 140 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    category: {
      type: String,
      required: [true, 'Food category is required'],
      enum: {
        values: [
          'Cooked Meals',
          'Bakery & Bread',
          'Fresh Produce',
          'Dairy Products',
          'Packaged Foods',
          'Beverages',
          'Other'
        ],
        message: 'Invalid food category'
      },
      index: true
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: {
        values: ['meals', 'kg', 'packets', 'servings', 'boxes', 'liters', 'portions'],
        message: 'Invalid quantity unit'
      }
    },
    preparationTime: {
      type: Date,
      required: [true, 'Preparation timestamp is required']
    },
    safeCollectionDeadline: {
      type: Date,
      required: [true, 'Safe collection deadline is required'],
      index: true
    },
    pickupWindow: {
      start: {
        type: Date,
        required: [true, 'Pickup window start time is required']
      },
      end: {
        type: Date,
        required: [true, 'Pickup window end time is required']
      }
    },
    pickupAddress: {
      street: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
      },
      landmark: {
        type: String,
        trim: true,
        default: ''
      },
      contactPhone: {
        type: String,
        required: [true, 'Contact phone is required'],
        trim: true
      }
    },
    allergens: {
      type: [String],
      default: []
    },
    dietaryType: {
      type: String,
      enum: ['Vegetarian', 'Vegan', 'Non-Vegetarian', 'Eggitarian'],
      default: 'Vegetarian'
    },
    storageCondition: {
      type: String,
      enum: ['Room Temperature', 'Refrigerated', 'Hot/Heated', 'Frozen'],
      default: 'Room Temperature'
    },
    imageUrl: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['available', 'claimed', 'picked_up', 'completed', 'cancelled', 'expired'],
      default: 'available',
      index: true
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    claimedAt: {
      type: Date
    },
    pickedUpAt: {
      type: Date
    },
    completedAt: {
      type: Date
    },
    cancelledAt: {
      type: Date
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    statusHistory: [statusHistorySchema]
  },
  {
    timestamps: true
  }
);

// Compound indexes for optimized query performance
donationSchema.index({ status: 1, safeCollectionDeadline: 1 });
donationSchema.index({ donor: 1, status: 1 });
donationSchema.index({ claimedBy: 1, status: 1 });
donationSchema.index({ category: 1, status: 1 });

const Donation = mongoose.model('Donation', donationSchema);
export default Donation;
