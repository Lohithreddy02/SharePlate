import User from '../models/User.js';
import Donation from '../models/Donation.js';

export const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`Database already contains ${userCount} users. Skipping seed.`);
      return;
    }

    console.log('Seeding initial demo data for SharePlate...');

    // Clear any remnants
    await User.deleteMany({});
    await Donation.deleteMany({});

    // 1. Create Administrator
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@shareplate.org',
      password: 'Admin@123',
      role: 'admin',
      phone: '+1 (555) 019-2834',
      address: 'SharePlate HQ, 100 Civic Center, Suite 400',
      organization: {
        name: 'SharePlate Global Operations',
        type: 'other',
        verificationStatus: 'approved',
        description: 'Primary platform governance and moderation staff'
      }
    });

    // 2. Create Food Donors
    const greenLeafBistro = await User.create({
      name: 'Chef Marcus Vance',
      email: 'donor@greenleaf.com',
      password: 'Donor@123',
      role: 'donor',
      phone: '+1 (555) 234-5678',
      address: '450 Oak Boulevard, Downtown Culinary District',
      organization: {
        name: 'Green Leaf Organic Bistro',
        type: 'restaurant',
        regNumber: 'RES-CA-99214',
        verificationStatus: 'not_applicable',
        description: 'Farm-to-table dining producing daily fresh wholesome meal surplus.'
      }
    });

    const campusCanteen = await User.create({
      name: 'Priya Sharma (Dining Manager)',
      email: 'canteen@university.edu',
      password: 'Donor@123',
      role: 'donor',
      phone: '+1 (555) 876-5432',
      address: 'North Quad Dining Hall, Central Campus Gate 3',
      organization: {
        name: 'University Central Canteen & Hostel Mess',
        type: 'canteen',
        regNumber: 'EDU-CANT-4410',
        verificationStatus: 'not_applicable',
        description: 'University hostel dining service preparing balanced daily meals for 1,200 students.'
      }
    });

    const artisanBakery = await User.create({
      name: 'Elena Rostova',
      email: 'bakery@goldenwheat.com',
      password: 'Donor@123',
      role: 'donor',
      phone: '+1 (555) 345-6789',
      address: '12 Bakery Lane, Market Square',
      organization: {
        name: 'Golden Wheat Artisan Bakery',
        type: 'restaurant',
        regNumber: 'BAK-88124',
        verificationStatus: 'not_applicable',
        description: 'Artisanal sourdough and pastry bakery with end-of-day fresh baked goods.'
      }
    });

    // 3. Create NGO / Food Recipients
    // A. Approved NGO
    const cityFoodRescue = await User.create({
      name: 'David Chen (Director)',
      email: 'ngo@cityrescue.org',
      password: 'Ngo@123',
      role: 'recipient',
      phone: '+1 (555) 987-6543',
      address: '782 Community Way, Westside',
      organization: {
        name: 'City Food Rescue Foundation',
        type: 'food_bank',
        regNumber: 'NGO-501C3-77281',
        verificationStatus: 'approved',
        verificationNotes: 'Verified non-profit charity registration and food-handling certified cold storage.',
        verifiedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        verifiedBy: admin._id,
        description: 'Non-profit food bank serving over 500 meals daily to disadvantaged community members.'
      }
    });

    // B. Pending NGO
    const hopeShelter = await User.create({
      name: 'Sarah Jenkins',
      email: 'hope@shelter.org',
      password: 'Ngo@123',
      role: 'recipient',
      phone: '+1 (555) 432-1098',
      address: '120 Elm Street, East District',
      organization: {
        name: 'Hope Community Night Shelter',
        type: 'shelter',
        regNumber: 'SHELTER-REG-39912',
        verificationStatus: 'pending',
        description: 'Temporary night shelter and soup kitchen providing emergency lodging and warm evening meals.'
      }
    });

    // C. Rejected NGO for testing
    await User.create({
      name: 'Robert Miller',
      email: 'robert@invalidgroup.org',
      password: 'Ngo@123',
      role: 'recipient',
      phone: '+1 (555) 111-2222',
      address: '99 Mystery St',
      organization: {
        name: 'Unregistered Community Pop-up',
        type: 'community',
        regNumber: '',
        verificationStatus: 'rejected',
        verificationNotes: 'Missing official 501(c)(3) documentation and valid tax-exempt proof.',
        verifiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        verifiedBy: admin._id,
        description: 'Informal neighbourhood volunteer club.'
      }
    });

    // 4. Create Sample Food Donations
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    const twelveHoursFromNow = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Donation 1: Available Cooked Meals from Campus Canteen (Urgent)
    await Donation.create({
      donor: campusCanteen._id,
      title: '60 Nutritious Dal, Rice, & Steamed Veggie Meals',
      description: 'Hot vegetarian lunch prepared today at 11:30 AM in hygienic stainless steel vessels. Kept heated in insulated commercial warmers. Ready for direct distribution.',
      category: 'Cooked Meals',
      quantity: 60,
      unit: 'meals',
      preparationTime: twoHoursAgo,
      safeCollectionDeadline: sixHoursFromNow,
      pickupWindow: {
        start: now,
        end: new Date(now.getTime() + 5 * 60 * 60 * 1000)
      },
      pickupAddress: {
        street: 'North Quad Dining Hall, Rear Loading Dock',
        city: 'Metro City',
        landmark: 'Near Gate 3 Security Post',
        contactPhone: '+1 (555) 876-5432'
      },
      allergens: ['Dairy'],
      dietaryType: 'Vegetarian',
      storageCondition: 'Hot/Heated',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      status: 'available',
      statusHistory: [
        {
          status: 'available',
          changedBy: campusCanteen._id,
          changedAt: twoHoursAgo,
          note: 'Published after university lunch service'
        }
      ]
    });

    // Donation 2: Available Fresh Bakery Loaves & Croissants
    await Donation.create({
      donor: artisanBakery._id,
      title: '35 Assorted Artisan Sourdough Loaves & Baguettes',
      description: 'Freshly baked this morning at 6:00 AM. Unsold stock from morning display. Packed in clean food-grade paper bags. Dry and room temperature.',
      category: 'Bakery & Bread',
      quantity: 35,
      unit: 'kg',
      preparationTime: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      safeCollectionDeadline: tomorrow,
      pickupWindow: {
        start: now,
        end: twelveHoursFromNow
      },
      pickupAddress: {
        street: '12 Bakery Lane, Market Square',
        city: 'Metro City',
        landmark: 'Side alley door with wooden awning',
        contactPhone: '+1 (555) 345-6789'
      },
      allergens: ['Gluten'],
      dietaryType: 'Vegan',
      storageCondition: 'Room Temperature',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      status: 'available',
      statusHistory: [
        {
          status: 'available',
          changedBy: artisanBakery._id,
          changedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
          note: 'Surplus bakery batch listed for evening collection'
        }
      ]
    });

    // Donation 3: Available Fresh Organic Produce from Green Leaf Bistro
    await Donation.create({
      donor: greenLeafBistro._id,
      title: '25 kg Fresh Salad Greens, Tomatoes, and Bell Peppers',
      description: 'Surplus organic raw vegetables delivered today from our regional farm partners. Crisp, washed, and stored in walk-in refrigeration at 4°C.',
      category: 'Fresh Produce',
      quantity: 25,
      unit: 'kg',
      preparationTime: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      safeCollectionDeadline: new Date(now.getTime() + 36 * 60 * 60 * 1000),
      pickupWindow: {
        start: now,
        end: tomorrow
      },
      pickupAddress: {
        street: '450 Oak Boulevard, Kitchen Entrance',
        city: 'Metro City',
        landmark: 'Opposite Central Park Fountain',
        contactPhone: '+1 (555) 234-5678'
      },
      allergens: [],
      dietaryType: 'Vegan',
      storageCondition: 'Refrigerated',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      status: 'available',
      statusHistory: [
        {
          status: 'available',
          changedBy: greenLeafBistro._id,
          changedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
          note: 'Listed fresh produce surplus'
        }
      ]
    });

    // Donation 4: Claimed Donation in Coordination
    await Donation.create({
      donor: greenLeafBistro._id,
      title: '40 Gourmet Pasta Primavera Portions',
      description: 'Cooked lunch pasta with roasted seasonal vegetables and marinara sauce. Packed in heat-sealed aluminum containers.',
      category: 'Cooked Meals',
      quantity: 40,
      unit: 'portions',
      preparationTime: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      safeCollectionDeadline: new Date(now.getTime() + 4 * 60 * 60 * 1000),
      pickupWindow: {
        start: now,
        end: new Date(now.getTime() + 3 * 60 * 60 * 1000)
      },
      pickupAddress: {
        street: '450 Oak Boulevard',
        city: 'Metro City',
        landmark: 'Kitchen Entrance',
        contactPhone: '+1 (555) 234-5678'
      },
      allergens: ['Gluten'],
      dietaryType: 'Vegetarian',
      storageCondition: 'Refrigerated',
      imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
      status: 'claimed',
      claimedBy: cityFoodRescue._id,
      claimedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      statusHistory: [
        {
          status: 'available',
          changedBy: greenLeafBistro._id,
          changedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
          note: 'Initial listing published'
        },
        {
          status: 'claimed',
          changedBy: cityFoodRescue._id,
          changedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
          note: 'Claimed by City Food Rescue Foundation (Van En Route)'
        }
      ]
    });

    // Donation 5: Completed Hand-off (Historical Success)
    await Donation.create({
      donor: campusCanteen._id,
      title: '80 Breakfast Sandwiches and Fresh Milk Cartons',
      description: 'Morning breakfast surplus safely collected and distributed to the local community center.',
      category: 'Packaged Foods',
      quantity: 80,
      unit: 'packets',
      preparationTime: new Date(now.getTime() - 28 * 60 * 60 * 1000),
      safeCollectionDeadline: new Date(now.getTime() - 18 * 60 * 60 * 1000),
      pickupWindow: {
        start: new Date(now.getTime() - 26 * 60 * 60 * 1000),
        end: new Date(now.getTime() - 20 * 60 * 60 * 1000)
      },
      pickupAddress: {
        street: 'North Quad Dining Hall',
        city: 'Metro City',
        landmark: 'Dock A',
        contactPhone: '+1 (555) 876-5432'
      },
      allergens: ['Dairy', 'Gluten'],
      dietaryType: 'Vegetarian',
      storageCondition: 'Refrigerated',
      imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
      status: 'completed',
      claimedBy: cityFoodRescue._id,
      claimedAt: new Date(now.getTime() - 25 * 60 * 60 * 1000),
      pickedUpAt: new Date(now.getTime() - 23 * 60 * 60 * 1000),
      completedAt: new Date(now.getTime() - 21 * 60 * 60 * 1000),
      statusHistory: [
        {
          status: 'available',
          changedBy: campusCanteen._id,
          changedAt: new Date(now.getTime() - 28 * 60 * 60 * 1000),
          note: 'Morning breakfast pack published'
        },
        {
          status: 'claimed',
          changedBy: cityFoodRescue._id,
          changedAt: new Date(now.getTime() - 25 * 60 * 60 * 1000),
          note: 'Claimed by City Food Rescue'
        },
        {
          status: 'picked_up',
          changedBy: cityFoodRescue._id,
          changedAt: new Date(now.getTime() - 23 * 60 * 60 * 1000),
          note: 'Inspected and loaded into refrigerated transport'
        },
        {
          status: 'completed',
          changedBy: cityFoodRescue._id,
          changedAt: new Date(now.getTime() - 21 * 60 * 60 * 1000),
          note: 'Distributed to 80 families at Westside shelter'
        }
      ]
    });

    // Donation 6: Expired Donation
    await Donation.create({
      donor: greenLeafBistro._id,
      title: '15 Boxed Rice Bowls (Past Deadline Example)',
      description: 'Historical listing illustrating automatic expiration safeguard.',
      category: 'Cooked Meals',
      quantity: 15,
      unit: 'boxes',
      preparationTime: new Date(yesterday.getTime() - 4 * 60 * 60 * 1000),
      safeCollectionDeadline: yesterday,
      pickupWindow: {
        start: new Date(yesterday.getTime() - 6 * 60 * 60 * 1000),
        end: yesterday
      },
      pickupAddress: {
        street: '450 Oak Boulevard',
        city: 'Metro City',
        landmark: 'Kitchen Backdoor',
        contactPhone: '+1 (555) 234-5678'
      },
      allergens: [],
      dietaryType: 'Vegan',
      storageCondition: 'Room Temperature',
      imageUrl: '',
      status: 'expired',
      statusHistory: [
        {
          status: 'available',
          changedBy: greenLeafBistro._id,
          changedAt: new Date(yesterday.getTime() - 6 * 60 * 60 * 1000),
          note: 'Published'
        },
        {
          status: 'expired',
          changedBy: greenLeafBistro._id,
          changedAt: yesterday,
          note: 'Deadline reached without claim'
        }
      ]
    });

    console.log('Database seeded successfully with demo users and realistic food donation listings.');
  } catch (error) {
    console.error('Database seeding failed:', error);
  }
};

// If run directly via node src/utils/seed.js
if (process.argv[1]?.endsWith('seed.js')) {
  import('../config/db.js').then(async ({ connectDB, closeDB }) => {
    await connectDB();
    await seedDatabase();
    await closeDB();
    process.exit(0);
  });
}
