
import express from 'express';
import cors from 'cors';
import { connectToMongoDB } from './mongodb-connector.js';
import User from './models/User.js';
import Business from './models/Business.js';
import Subscription from './models/Subscription.js';
import SubscriptionPackage from './models/SubscriptionPackage.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB on startup
connectToMongoDB();

// --- User APIs ---
// Get user by UID
app.get('/api/users/:uid', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update user
app.post('/api/users', async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ message: 'User UID is required' });

    const user = await User.findOneAndUpdate(
      { uid },
      req.body,
      { upsert: true, new: true }
    );
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user role
app.put('/api/users/:uid/role', async (req, res) => {
  try {
    const { role, isAdmin = false } = req.body;
    if (!role) return res.status(400).json({ message: 'Role is required' });

    const user = await User.findOneAndUpdate(
      { uid: req.params.uid },
      { role, isAdmin },
      { new: true }
    );
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user login timestamp
app.put('/api/users/:uid/login', async (req, res) => {
  try {
    await User.updateOne(
      { uid: req.params.uid },
      { $set: { lastLogin: new Date() } }
    );
    res.status(200).json({ message: 'Login timestamp updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Business APIs ---
// Get all businesses
app.get('/api/businesses', async (req, res) => {
  try {
    const businesses = await Business.find();
    res.status(200).json(businesses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get business by ID
app.get('/api/businesses/:id', async (req, res) => {
  try {
    const business = await Business.findOne({ id: req.params.id });
    if (!business) return res.status(404).json({ message: 'Business not found' });
    res.status(200).json(business);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update business
app.post('/api/businesses', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: 'Business ID is required' });

    const business = await Business.findOneAndUpdate(
      { id },
      req.body,
      { upsert: true, new: true }
    );
    res.status(201).json(business);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete business
app.delete('/api/businesses/:id', async (req, res) => {
  try {
    const result = await Business.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Business not found' });
    }
    res.status(200).json({ message: 'Business deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Subscription Package APIs ---
// Get all subscription packages
app.get('/api/subscription-packages', async (req, res) => {
  try {
    const packages = await SubscriptionPackage.find();
    res.status(200).json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get subscription packages by type
app.get('/api/subscription-packages/type/:type', async (req, res) => {
  try {
    const packages = await SubscriptionPackage.find({ type: req.params.type });
    res.status(200).json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update subscription package
app.post('/api/subscription-packages', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: 'Package ID is required' });

    const subscriptionPackage = await SubscriptionPackage.findOneAndUpdate(
      { id },
      req.body,
      { upsert: true, new: true }
    );
    res.status(201).json(subscriptionPackage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete subscription package
app.delete('/api/subscription-packages/:id', async (req, res) => {
  try {
    const result = await SubscriptionPackage.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Subscription package not found' });
    }
    res.status(200).json({ message: 'Subscription package deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- User Subscriptions APIs ---
// Get user subscription
app.get('/api/subscriptions/user/:userId', async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ 
      userId: req.params.userId,
      status: "active"
    }).sort({ startDate: -1 });
    
    if (subscriptions.length === 0) {
      return res.status(404).json({ message: 'No active subscription found' });
    }
    
    res.status(200).json(subscriptions[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update subscription
app.post('/api/subscriptions', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: 'Subscription ID is required' });

    const subscription = await Subscription.findOneAndUpdate(
      { id },
      req.body,
      { upsert: true, new: true }
    );
    
    // Update user record with subscription reference
    await User.findOneAndUpdate(
      { uid: subscription.userId },
      { 
        subscription: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionPackage: subscription.packageId
      }
    );
    
    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MongoDB initialization endpoint
app.post('/api/initialize-mongodb', async (req, res) => {
  try {
    await connectToMongoDB();
    const collections = [
      'User',
      'Business',
      'Subscription',
      'SubscriptionPackage'
    ];
    
    res.status(200).json({ 
      success: true, 
      message: 'MongoDB initialized successfully',
      collections
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Test connection endpoint
app.get('/api/test-connection', async (req, res) => {
  try {
    const connected = await connectToMongoDB();
    res.status(200).json({ 
      success: connected,
      message: connected ? 'Connected to MongoDB' : 'Failed to connect to MongoDB'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
