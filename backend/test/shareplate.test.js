import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Donation from '../src/models/Donation.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await User.deleteMany({});
  await Donation.deleteMany({});
});

describe('SharePlate Integration & Workflow Test Suite', () => {
  // Helper to create donor
  const createDonor = async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Downtown Bistro',
      email: 'donor@bistro.com',
      password: 'Password123',
      role: 'donor',
      phone: '+1 555-1234',
      organization: {
        name: 'Downtown Bistro LLC',
        type: 'restaurant'
      }
    });
    return { token: res.body.token, user: res.body.user };
  };

  // Helper to create recipient
  const createRecipient = async (email = 'ngo@help.org', verificationStatus = 'approved') => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'City Shelter',
      email,
      password: 'Password123',
      role: 'recipient',
      phone: '+1 555-4321',
      organization: {
        name: 'City Care Shelter',
        type: 'shelter',
        regNumber: 'REG-9912',
        verificationStatus
      }
    });

    // If approved, update DB directly because registration defaults recipient to 'pending'
    if (verificationStatus === 'approved') {
      await User.findByIdAndUpdate(res.body.user._id, {
        'organization.verificationStatus': 'approved'
      });
    }

    return { token: res.body.token, user: res.body.user };
  };

  // Helper to create admin
  const createAdmin = async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Admin User',
      email: 'admin@shareplate.org',
      password: 'AdminPassword123',
      role: 'admin',
      phone: '+1 555-0000',
      organization: {
        name: 'SharePlate Platform',
        type: 'other'
      }
    });
    return { token: res.body.token, user: res.body.user };
  };

  describe('1. Authentication & Role Permissions', () => {
    it('registers a donor successfully', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Campus Kitchen',
        email: 'campus@uni.edu',
        password: 'SecurePass123',
        role: 'donor',
        phone: '+1 555-9988',
        organization: { name: 'Campus Mess', type: 'canteen' }
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('donor');
      expect(res.body.user.organization.verificationStatus).toBe('not_applicable');
    });

    it('registers successfully via /auth/register (direct root route compatibility)', async () => {
      const res = await request(app).post('/auth/register').send({
        name: 'Direct Route Donor',
        email: 'direct@route.com',
        password: 'SecurePass123',
        role: 'donor',
        phone: '+1 555-4321',
        organization: { name: 'Direct Mess', type: 'canteen' }
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('rejects duplicate email registration', async () => {
      await createDonor();
      const res = await request(app).post('/api/auth/register').send({
        name: 'Another Bistro',
        email: 'donor@bistro.com',
        password: 'Password123',
        role: 'donor',
        phone: '+1 555-0000'
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('logs in registered user with correct password', async () => {
      await createDonor();
      const res = await request(app).post('/api/auth/login').send({
        email: 'donor@bistro.com',
        password: 'Password123'
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('donor@bistro.com');
    });

    it('rejects login with invalid password', async () => {
      await createDonor();
      const res = await request(app).post('/api/auth/login').send({
        email: 'donor@bistro.com',
        password: 'WrongPassword'
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('returns current profile via /api/auth/me', async () => {
      const { token } = await createDonor();
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('donor@bistro.com');
    });
  });

  describe('2. Donation Creation & Validation (Workflow A)', () => {
    it('creates a donation listing when valid', async () => {
      const { token } = await createDonor();
      const now = new Date();
      const deadline = new Date(now.getTime() + 8 * 60 * 60 * 1000);
      const windowStart = new Date(now.getTime() + 1 * 60 * 60 * 1000);
      const windowEnd = new Date(now.getTime() + 4 * 60 * 60 * 1000);

      const res = await request(app)
        .post('/api/donations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: '30 Surplus Rice Bowls',
          description: 'Steamed jasmine rice with stir fried veggies in eco-packaging',
          category: 'Cooked Meals',
          quantity: 30,
          unit: 'meals',
          preparationTime: now.toISOString(),
          safeCollectionDeadline: deadline.toISOString(),
          pickupWindow: {
            start: windowStart.toISOString(),
            end: windowEnd.toISOString()
          },
          pickupAddress: {
            street: '100 Main St',
            city: 'Metroville',
            contactPhone: '+1 555-1234'
          },
          dietaryType: 'Vegan',
          storageCondition: 'Hot/Heated'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.donation.title).toBe('30 Surplus Rice Bowls');
      expect(res.body.donation.status).toBe('available');
      expect(res.body.donation.statusHistory).toHaveLength(1);
    });

    it('rejects donation creation when deadline is in the past', async () => {
      const { token } = await createDonor();
      const now = new Date();
      const pastDeadline = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      const res = await request(app)
        .post('/api/donations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Expired Food Test',
          description: 'Should fail validation',
          category: 'Cooked Meals',
          quantity: 10,
          unit: 'meals',
          preparationTime: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
          safeCollectionDeadline: pastDeadline.toISOString(),
          pickupWindow: {
            start: pastDeadline.toISOString(),
            end: now.toISOString()
          },
          pickupAddress: {
            street: '100 Main St',
            city: 'Metroville',
            contactPhone: '+1 555-1234'
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/safe collection deadline must be a valid future/i);
    });

    it('rejects donation creation with invalid quantity <= 0', async () => {
      const { token } = await createDonor();
      const now = new Date();
      const deadline = new Date(now.getTime() + 6 * 60 * 60 * 1000);

      const res = await request(app)
        .post('/api/donations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Zero Quantity Food',
          description: 'Testing non-positive quantity',
          category: 'Cooked Meals',
          quantity: 0,
          unit: 'meals',
          preparationTime: now.toISOString(),
          safeCollectionDeadline: deadline.toISOString(),
          pickupWindow: {
            start: now.toISOString(),
            end: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString()
          },
          pickupAddress: {
            street: '100 Main St',
            city: 'Metroville',
            contactPhone: '+1 555-1234'
          }
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/quantity must be a positive number/i);
    });
  });

  describe('3. Discovery & Filtering (Workflow B)', () => {
    it('filters out expired donations from public feed', async () => {
      const { token } = await createDonor();
      const now = new Date();

      // 1 valid donation
      await request(app)
        .post('/api/donations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Active Fresh Bread',
          description: 'Fresh baguettes',
          category: 'Bakery & Bread',
          quantity: 20,
          unit: 'kg',
          preparationTime: now.toISOString(),
          safeCollectionDeadline: new Date(now.getTime() + 10 * 60 * 60 * 1000).toISOString(),
          pickupWindow: {
            start: now.toISOString(),
            end: new Date(now.getTime() + 5 * 60 * 60 * 1000).toISOString()
          },
          pickupAddress: { street: '12 Bakery Ln', city: 'Metroville', contactPhone: '+1 555-1234' }
        });

      // Insert an expired donation directly to DB
      const donorUser = await User.findOne({ email: 'donor@bistro.com' });
      await Donation.create({
        donor: donorUser._id,
        title: 'Already Expired Soup',
        description: 'Past deadline',
        category: 'Cooked Meals',
        quantity: 15,
        unit: 'meals',
        preparationTime: new Date(now.getTime() - 10 * 60 * 60 * 1000),
        safeCollectionDeadline: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        pickupWindow: {
          start: new Date(now.getTime() - 8 * 60 * 60 * 1000),
          end: new Date(now.getTime() - 2 * 60 * 60 * 1000)
        },
        pickupAddress: { street: '12 Bakery Ln', city: 'Metroville', contactPhone: '+1 555-1234' },
        status: 'available'
      });

      const feedRes = await request(app).get('/api/donations');
      expect(feedRes.status).toBe(200);
      expect(feedRes.body.donations).toHaveLength(1);
      expect(feedRes.body.donations[0].title).toBe('Active Fresh Bread');
    });
  });

  describe('4. Atomic Claim & Verification Restrictions (Workflow B & D)', () => {
    it('blocks unverified / pending recipient from claiming a donation', async () => {
      const { token: donorToken } = await createDonor();
      const { token: pendingNgoToken } = await createRecipient('pending@ngo.org', 'pending');

      const now = new Date();
      const donationRes = await request(app)
        .post('/api/donations')
        .set('Authorization', `Bearer ${donorToken}`)
        .send({
          title: 'Surplus Pastries',
          description: 'Delicious morning pastries',
          category: 'Bakery & Bread',
          quantity: 10,
          unit: 'boxes',
          preparationTime: now.toISOString(),
          safeCollectionDeadline: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
          pickupWindow: {
            start: now.toISOString(),
            end: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString()
          },
          pickupAddress: { street: '45 Lake Rd', city: 'Metroville', contactPhone: '+1 555-1234' }
        });

      const claimRes = await request(app)
        .post(`/api/donations/${donationRes.body.donation._id}/claim`)
        .set('Authorization', `Bearer ${pendingNgoToken}`);

      expect(claimRes.status).toBe(403);
      expect(claimRes.body.isVerificationRestricted).toBe(true);
      expect(claimRes.body.verificationStatus).toBe('pending');
    });

    it('allows verified recipient to claim donation successfully', async () => {
      const { token: donorToken } = await createDonor();
      const { token: ngoToken } = await createRecipient('approved@ngo.org', 'approved');

      const now = new Date();
      const donationRes = await request(app)
        .post('/api/donations')
        .set('Authorization', `Bearer ${donorToken}`)
        .send({
          title: 'Surplus Casserole',
          description: 'Hot vegetable casserole',
          category: 'Cooked Meals',
          quantity: 25,
          unit: 'servings',
          preparationTime: now.toISOString(),
          safeCollectionDeadline: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
          pickupWindow: {
            start: now.toISOString(),
            end: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString()
          },
          pickupAddress: { street: '10 River St', city: 'Metroville', contactPhone: '+1 555-1234' }
        });

      const claimRes = await request(app)
        .post(`/api/donations/${donationRes.body.donation._id}/claim`)
        .set('Authorization', `Bearer ${ngoToken}`);

      expect(claimRes.status).toBe(200);
      expect(claimRes.body.success).toBe(true);
      expect(claimRes.body.donation.status).toBe('claimed');
      expect(claimRes.body.donation.claimedBy).toBeDefined();
    });

    it('prevents two recipients from claiming the same donation simultaneously (atomic concurrency test)', async () => {
      const { token: donorToken } = await createDonor();
      const { token: ngo1Token } = await createRecipient('ngo1@test.org', 'approved');
      const { token: ngo2Token } = await createRecipient('ngo2@test.org', 'approved');

      const now = new Date();
      const donationRes = await request(app)
        .post('/api/donations')
        .set('Authorization', `Bearer ${donorToken}`)
        .send({
          title: 'Contested Pizza Slices',
          description: 'Single item tested for concurrent claim collision',
          category: 'Cooked Meals',
          quantity: 20,
          unit: 'portions',
          preparationTime: now.toISOString(),
          safeCollectionDeadline: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
          pickupWindow: {
            start: now.toISOString(),
            end: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString()
          },
          pickupAddress: { street: '10 River St', city: 'Metroville', contactPhone: '+1 555-1234' }
        });

      const donationId = donationRes.body.donation._id;

      // Execute both claim requests concurrently
      const [claim1, claim2] = await Promise.all([
        request(app).post(`/api/donations/${donationId}/claim`).set('Authorization', `Bearer ${ngo1Token}`),
        request(app).post(`/api/donations/${donationId}/claim`).set('Authorization', `Bearer ${ngo2Token}`)
      ]);

      const statuses = [claim1.status, claim2.status];
      expect(statuses).toContain(200);
      expect(statuses).toContain(409); // Exactly one succeeded, one failed with Conflict

      const winner = claim1.status === 200 ? claim1 : claim2;
      const loser = claim1.status === 409 ? claim1 : claim2;

      expect(winner.body.success).toBe(true);
      expect(loser.body.success).toBe(false);
      expect(loser.body.message).toMatch(/already been claimed/i);
    });
  });

  describe('5. Pickup & Complete Lifecycle (Workflow C)', () => {
    it('progresses donation from claimed -> picked_up -> completed', async () => {
      const { token: donorToken } = await createDonor();
      const { token: ngoToken } = await createRecipient('rescue@ngo.org', 'approved');

      const now = new Date();
      const createRes = await request(app)
        .post('/api/donations')
        .set('Authorization', `Bearer ${donorToken}`)
        .send({
          title: 'Fresh Sandwiches',
          description: 'Prepared lunch sandwiches',
          category: 'Packaged Foods',
          quantity: 50,
          unit: 'packets',
          preparationTime: now.toISOString(),
          safeCollectionDeadline: new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString(),
          pickupWindow: {
            start: now.toISOString(),
            end: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString()
          },
          pickupAddress: { street: '99 High Rd', city: 'Metroville', contactPhone: '+1 555-1234' }
        });

      const donationId = createRes.body.donation._id;

      // 1. Claim
      await request(app)
        .post(`/api/donations/${donationId}/claim`)
        .set('Authorization', `Bearer ${ngoToken}`);

      // 2. Pickup
      const pickupRes = await request(app)
        .post(`/api/donations/${donationId}/pickup`)
        .set('Authorization', `Bearer ${ngoToken}`);

      expect(pickupRes.status).toBe(200);
      expect(pickupRes.body.donation.status).toBe('picked_up');
      expect(pickupRes.body.donation.pickedUpAt).toBeDefined();

      // 3. Complete
      const completeRes = await request(app)
        .post(`/api/donations/${donationId}/complete`)
        .set('Authorization', `Bearer ${ngoToken}`);

      expect(completeRes.status).toBe(200);
      expect(completeRes.body.donation.status).toBe('completed');
      expect(completeRes.body.donation.completedAt).toBeDefined();

      // 4. Invalid transition: cannot cancel completed donation
      const cancelRes = await request(app)
        .patch(`/api/donations/${donationId}/cancel`)
        .set('Authorization', `Bearer ${donorToken}`)
        .send({ reason: 'Changed mind' });

      expect(cancelRes.status).toBe(400);
      expect(cancelRes.body.message).toMatch(/cannot cancel a donation that is already 'completed'/i);
    });
  });

  describe('6. Admin Governance & Verification Queue (Workflow D)', () => {
    it('allows admin to approve pending recipient verification', async () => {
      const { token: adminToken } = await createAdmin();
      const { user: pendingUser } = await createRecipient('newbie@charity.org', 'pending');

      // Check verification list
      const listRes = await request(app)
        .get('/api/admin/verifications?status=pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.organizations.some((org) => org._id.toString() === pendingUser._id.toString())).toBe(true);

      // Approve verification
      const approveRes = await request(app)
        .patch(`/api/admin/verifications/${pendingUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved', notes: 'Valid 501(c)(3) certificate verified' });

      expect(approveRes.status).toBe(200);
      expect(approveRes.body.user.organization.verificationStatus).toBe('approved');
    });

    it('returns aggregate platform metrics to admin', async () => {
      const { token: adminToken } = await createAdmin();
      await createDonor();

      const metricsRes = await request(app)
        .get('/api/admin/metrics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(metricsRes.status).toBe(200);
      expect(metricsRes.body.metrics.users.donors).toBeGreaterThanOrEqual(1);
      expect(metricsRes.body.metrics.donations).toBeDefined();
    });
  });
});
