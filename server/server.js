import express from 'express';
import cors from 'cors';
// Mongo related imports kept but we won't use them for writes (per instruction)
import crypto from 'crypto';
import { generatePayUHash, getPayUMerchantKey, buildPayUParams } from './payu.js';
import { createPayuPlan, createPayuSubscription, verifyWebhook, parseMandateWebhook } from './payuSubscriptions.js';
// Remove Mongo models usage

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS properly to fix the CORS issues
const corsOptions = {
  origin: ['http://localhost:8080', 'http://localhost:5173', 'https://gbv-backend.onrender.com', '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Direct-MongoDB', 'X-Environment'],
  credentials: false,
  optionsSuccessStatus: 200
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

// Add a pre-flight check for OPTIONS requests
app.options('*', cors(corsOptions));

// Middleware to log requests - helps with debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Skipping MongoDB connection as per new requirement: use Supabase/Vercel only

// Test connection with collection info
app.get('/api/test-connection', async (req, res) => {
  // Set CORS headers explicitly for this route
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  try {
    res.status(200).json({ success: true, message: 'Server is up' });
  } catch (error) {
    console.error('Error testing MongoDB connection:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Add explicit test for the user collection
app.get('/api/test-collection', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectToMongoDB();
    }
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const hasUserCollection = collections.some(c => c.name === 'user');
    
    // Try to count documents in the user collection
    let userCount = 0;
    if (hasUserCollection) {
      userCount = await db.collection('user').countDocuments();
    }
    
    res.status(200).json({
      success: true,
      database: mongoose.connection.name,
      userCollectionExists: hasUserCollection,
      userDocumentCount: userCount,
      allCollections: collections.map(c => c.name)
    });
  } catch (error) {
    console.error('Error testing collection access:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// --- User APIs ---
// Get user by UID
app.get('/api/users/:uid', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create or update user
app.post('/api/users', async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ message: 'User UID is required' });

    // Check if user exists
    const existingUser = await User.findOne({ uid });
    
    if (existingUser) {
      // Update existing user
      const user = await User.findOneAndUpdate(
        { uid },
        { ...req.body, updatedAt: new Date() },
        { new: true }
      );
      res.status(200).json(user);
    } else {
      // Create new user
      const newUser = new User({
        ...req.body,
        createdAt: new Date(),
        lastLogin: new Date()
      });
      await newUser.save();
      res.status(201).json(newUser);
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user login timestamp
app.put('/api/users/:uid/login', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { uid: req.params.uid },
      { lastLogin: new Date() },
      { new: true }
    );
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'Login timestamp updated' });
  } catch (error) {
    console.error('Error updating login timestamp:', error);
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
      { role, isAdmin, updatedAt: new Date() },
      { new: true }
    );
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- Business APIs ---
// Get all businesses
app.get('/api/businesses', async (req, res) => {
  try {
    // Add query parameters for filtering
    const { category, featured, search } = req.query;
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (featured === 'true') {
      query.featured = true;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    
    const businesses = await Business.find(query);
    res.status(200).json(businesses);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get business by ID
app.get('/api/businesses/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid business ID' });
    
    const business = await Business.findOne({ id });
    if (!business) return res.status(404).json({ message: 'Business not found' });
    
    res.status(200).json(business);
  } catch (error) {
    console.error('Error fetching business:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create or update business
app.post('/api/businesses', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: 'Business ID is required' });

    // Check if business already exists
    const existingBusiness = await Business.findOne({ id });
    
    if (existingBusiness) {
      // Update existing business
      const business = await Business.findOneAndUpdate(
        { id },
        { ...req.body, updatedAt: new Date() },
        { new: true }
      );
      res.status(200).json(business);
    } else {
      // Create new business
      const newBusiness = new Business({
        ...req.body,
        createdAt: new Date()
      });
      await newBusiness.save();
      res.status(201).json(newBusiness);
    }
  } catch (error) {
    console.error('Error creating/updating business:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete business
app.delete('/api/businesses/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid business ID' });
    
    const result = await Business.deleteOne({ id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    res.status(200).json({ message: 'Business deleted successfully' });
  } catch (error) {
    console.error('Error deleting business:', error);
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
    console.error('Error fetching subscription packages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get subscription packages by type
app.get('/api/subscription-packages/type/:type', async (req, res) => {
  try {
    const packages = await SubscriptionPackage.find({ type: req.params.type });
    res.status(200).json(packages);
  } catch (error) {
    console.error('Error fetching subscription packages by type:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create or update subscription package
app.post('/api/subscription-packages', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: 'Package ID is required' });

    // Check if package already exists
    const existingPackage = await SubscriptionPackage.findOne({ id });
    
    if (existingPackage) {
      // Update existing package
      const subscriptionPackage = await SubscriptionPackage.findOneAndUpdate(
        { id },
        { ...req.body, updatedAt: new Date() },
        { new: true }
      );
      res.status(200).json(subscriptionPackage);
    } else {
      // Create new package
      const newPackage = new SubscriptionPackage({
        ...req.body,
        createdAt: new Date()
      });
      await newPackage.save();
      res.status(201).json(newPackage);
    }
  } catch (error) {
    console.error('Error creating/updating subscription package:', error);
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
    console.error('Error deleting subscription package:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- User Subscriptions APIs ---
// Get user subscription
app.get('/api/subscriptions/user/:userId', async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ 
      userId: req.params.userId,
      status: { $in: ["active", "trial"] }
    }).sort({ startDate: -1 });
    
    if (subscriptions.length === 0) {
      return res.status(404).json({ message: 'No active subscription found' });
    }
    
    res.status(200).json(subscriptions[0]);
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create or update subscription
app.post('/api/subscriptions', async (req, res) => {
  try {
    const { id, userId, packageId } = req.body;
    
    if (!id) return res.status(400).json({ message: 'Subscription ID is required' });
    if (!userId) return res.status(400).json({ message: 'User ID is required' });
    if (!packageId) return res.status(400).json({ message: 'Package ID is required' });

    // Check if subscription already exists
    const existingSubscription = await Subscription.findOne({ id });
    
    if (existingSubscription) {
      // Update existing subscription
      const subscription = await Subscription.findOneAndUpdate(
        { id },
        { ...req.body, updatedAt: new Date() },
        { new: true }
      );
      
      // Update user's subscription reference
      await User.findOneAndUpdate(
        { uid: userId },
        { 
          subscription: id,
          subscriptionStatus: req.body.status || existingSubscription.status,
          subscriptionPackage: packageId,
          updatedAt: new Date()
        }
      );
      
      res.status(200).json(subscription);
    } else {
      // Create new subscription
      const newSubscription = new Subscription({
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await newSubscription.save();
      
      // Update user's subscription reference
      await User.findOneAndUpdate(
        { uid: userId },
        { 
          subscription: id,
          subscriptionStatus: req.body.status || 'active',
          subscriptionPackage: packageId,
          updatedAt: new Date()
        }
      );
      
      res.status(201).json(newSubscription);
    }
  } catch (error) {
    console.error('Error creating/updating subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- Subscription Settings APIs ---
// Get global subscription settings
app.get('/api/subscription-settings', async (req, res) => {
  try {
    let settings = await SubscriptionSettings.findOne({ id: 'global' });
    
    if (!settings) {
      // Create default settings if none exist
      settings = new SubscriptionSettings({
        id: 'global',
        shouldUseLocalFallback: true,
        allowNonAdminSubscriptions: true,
        requiresPayment: false,
        defaultGracePeriodDays: 7,
        defaultAdvancePaymentMonths: 1
      });
      await settings.save();
    }
    
    res.status(200).json(settings);
  } catch (error) {
    console.error('Error fetching subscription settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update subscription settings
app.post('/api/subscription-settings', async (req, res) => {
  try {
    const settings = await SubscriptionSettings.findOneAndUpdate(
      { id: 'global' },
      { ...req.body, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    
    res.status(200).json(settings);
  } catch (error) {
    console.error('Error updating subscription settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// MongoDB initialization endpoint
app.post('/api/initialize-mongodb', async (req, res) => {
  try {
    const connected = await connectToMongoDB();
    
    if (!connected) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to connect to MongoDB' 
      });
    }
    
    // Check if the required collections exist and have data
    const userCount = await User.estimatedDocumentCount();
    const businessCount = await Business.estimatedDocumentCount();
    const subscriptionCount = await Subscription.estimatedDocumentCount();
    const packageCount = await SubscriptionPackage.estimatedDocumentCount();
    
    res.status(200).json({ 
      success: true, 
      message: 'MongoDB is initialized and ready',
      collections: {
        users: { count: userCount },
        businesses: { count: businessCount },
        subscriptions: { count: subscriptionCount },
        packages: { count: packageCount }
      }
    });
  } catch (error) {
    console.error('Error initializing MongoDB:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// CSV upload endpoint
app.post('/api/upload-csv', async (req, res) => {
  try {
    const { businesses } = req.body;
    
    if (!businesses || !Array.isArray(businesses)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request format, businesses array required' 
      });
    }
    
    let inserted = 0;
    let updated = 0;
    let errors = 0;
    
    for (const business of businesses) {
      try {
        // Check if business already exists
        const existingBusiness = await Business.findOne({ id: business.id });
        
        if (existingBusiness) {
          // Update existing business
          await Business.updateOne(
            { id: business.id },
            { ...business, updatedAt: new Date() }
          );
          updated++;
        } else {
          // Insert new business
          const newBusiness = new Business({
            ...business,
            createdAt: new Date()
          });
          await newBusiness.save();
          inserted++;
        }
      } catch (businessError) {
        console.error('Error processing business:', businessError);
        errors++;
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Processed ${businesses.length} businesses: ${inserted} inserted, ${updated} updated, ${errors} errors`,
      stats: { inserted, updated, errors }
    });
  } catch (error) {
    console.error('Error uploading CSV data:', error);
    res.status(500).json({
      success: false,
      message: `Error processing CSV: ${error.message}`
    });
  }
});

// Direct MongoDB test insert API
app.post('/api/direct-insert', async (req, res) => {
  try {
    const { collection, document } = req.body;
    
    if (!collection || !document) {
      return res.status(400).json({
        success: false,
        message: 'Collection name and document are required'
      });
    }
    
    if (mongoose.connection.readyState !== 1) {
      await connectToMongoDB();
    }
    
    const result = await mongoose.connection.db.collection(collection).insertOne(document);
    
    res.status(200).json({
      success: true,
      message: `Document inserted into ${collection}`,
      insertedId: result.insertedId,
      document
    });
  } catch (error) {
    console.error('Error with direct insert:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// --- PayU Payment APIs ---
// Generate hash for PayU payment (secure, server-side)
app.post('/api/payu/generate-hash', (req, res) => {
  try {
    const params = req.body;
    if (!params || !params.txnid || !params.amount || !params.productinfo || !params.firstname || !params.email) {
      return res.status(400).json({ error: 'Missing required payment parameters' });
    }
    const hash = generatePayUHash({
      key: getPayUMerchantKey(),
      txnid: params.txnid,
      amount: params.amount,
      productinfo: params.productinfo,
      firstname: params.firstname,
      email: params.email,
      udf1: params.udf1,
      udf2: params.udf2,
      udf3: params.udf3,
      udf4: params.udf4,
      udf5: params.udf5,
      udf6: params.udf6,
      udf7: params.udf7,
      udf8: params.udf8,
      udf9: params.udf9,
      udf10: params.udf10
    });
    res.json({ hash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initiate PayU payment (returns required params for frontend form submission)
app.post('/api/payu/initiate-payment', (req, res) => {
  try {
    const { amount, productinfo, firstname, email, phone, surl, furl, txnid, si, si_details, ...rest } = req.body;
    if (!amount || !productinfo || !firstname || !email || !phone || !surl || !furl || !txnid) {
      return res.status(400).json({ error: 'Missing required payment parameters' });
    }
    const key = getPayUMerchantKey();
    const normalizeAscii = (s) => String(s || '')
      .replace(/[\u2000-\u206F\u2E00-\u2E7F\u00A0-\u00BF]/g, ' ')
      .replace(/[\u20B9\uFE0F]/g, '')
      .replace(/[^\x20-\x7E]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120);
    const amt = Number(amount).toFixed(2);
    const pinfo = normalizeAscii(productinfo);
    const params = {
      key: String(key),
      txnid: String(txnid),
      amount: String(amt),
      productinfo: String(pinfo),
      firstname: String(firstname),
      email: String(email),
      phone: String(phone),
      surl: String(surl),
      furl: String(furl),
      // pass-through SI fields (not part of hash)
      ...(si ? { si: String(si) } : {}),
      ...(si_details ? { si_details: String(si_details) } : {}),
      udf1: String(rest.udf1 || ''),
      udf2: String(rest.udf2 || ''),
      udf3: String(rest.udf3 || ''),
      udf4: String(rest.udf4 || ''),
      udf5: String(rest.udf5 || ''),
      udf6: String(rest.udf6 || ''),
      udf7: String(rest.udf7 || ''),
      udf8: String(rest.udf8 || ''),
      udf9: String(rest.udf9 || ''),
      udf10: String(rest.udf10 || ''),
    };
    // Log and sanitize all params before hashing
    console.log('PayU params for hash:', params);
    Object.keys(params).forEach(key => {
      if (typeof params[key] === 'object') {
        // Only clean object-typed UDFs; keep si_details String as-is
        params[key] = '';
      }
    });
    const hash = generatePayUHash(params);
    const payuParams = buildPayUParams({ ...params, hash });
    // Log a minimal view (without hash) to verify SI fields reach PayU
    const debugOut = { ...payuParams };
    delete debugOut.hash;
    console.log('Returning PayU form params:', debugOut);
    res.json({
      ...payuParams,
      payuBaseUrl: 'https://secure.payu.in/_payment' // LIVE PayU endpoint
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PayU Subscriptions (non-breaking: separate routes) ---
app.post('/api/payu/subscriptions/create-plan', async (req, res) => {
  try {
    const { name, amount, intervalMonths } = req.body || {};
    if (!name || !amount || !intervalMonths) return res.status(400).json({ error: 'name, amount, intervalMonths required' });
    const plan = await createPayuPlan({ name, amount, intervalMonths });
    res.json(plan);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/payu/subscriptions/create', async (req, res) => {
  try {
    const { planId, customer, startTimeUtc, referenceId } = req.body || {};
    if (!planId) return res.status(400).json({ error: 'planId required' });
    const sub = await createPayuSubscription({ planId, customer, startTimeUtc, referenceId });
    res.json(sub);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/payu/subscriptions/mandate/callback', express.raw({ type: '*/*' }), async (req, res) => {
  try {
    if (!verifyWebhook(req)) return res.status(401).end();
    const { event, status, umrn, referenceId } = parseMandateWebhook(req);
    console.log('PayU mandate webhook:', { event, status, umrn, referenceId });
    // Supabase-managed; no Mongo updates here
    res.status(200).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
