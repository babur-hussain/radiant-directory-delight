
/**
 * Firestore to MongoDB Migration Utility
 * 
 * This module provides functions to migrate data from Firestore to MongoDB
 */

import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { User } from '../models/User';
import { Subscription } from '../models/Subscription';
import { Business } from '../models/Business';

/**
 * Migrates users from Firestore to MongoDB
 */
export const migrateUsersFromFirestore = async (progressCallback?: (progress: number) => void): Promise<{ success: number; failed: number }> => {
  try {
    const usersCollection = collection(db, "users");
    const snapshot = await getDocs(usersCollection);
    
    let success = 0;
    let failed = 0;
    let processed = 0;
    const total = snapshot.docs.length;
    
    for (const doc of snapshot.docs) {
      try {
        const userData = doc.data();
        
        // Check if user already exists in MongoDB
        const existingUser = await User.findOne({ uid: doc.id });
        
        if (!existingUser) {
          // Create new user in MongoDB
          await User.create({
            uid: doc.id,
            name: userData.name || userData.displayName,
            email: userData.email,
            role: userData.role || 'user',
            isAdmin: userData.isAdmin || false,
            photoURL: userData.photoURL,
            createdAt: userData.createdAt?.toDate() || new Date(),
            lastLogin: userData.lastLogin?.toDate() || new Date()
          });
          success++;
        } else {
          // Update existing user
          await User.updateOne(
            { uid: doc.id },
            {
              $set: {
                name: userData.name || userData.displayName,
                email: userData.email,
                role: userData.role || existingUser.role,
                isAdmin: userData.isAdmin || existingUser.isAdmin,
                photoURL: userData.photoURL || existingUser.photoURL,
                lastLogin: new Date()
              }
            }
          );
          success++;
        }
      } catch (error) {
        console.error(`Failed to migrate user ${doc.id}:`, error);
        failed++;
      }
      
      processed++;
      if (progressCallback) {
        progressCallback(processed / total);
      }
    }
    
    return { success, failed };
  } catch (error) {
    console.error("Failed to migrate users:", error);
    return { success: 0, failed: 0 };
  }
};

/**
 * Migrates subscriptions from Firestore to MongoDB
 */
export const migrateSubscriptionsFromFirestore = async (progressCallback?: (progress: number) => void): Promise<{ success: number; failed: number }> => {
  try {
    const subscriptionsCollection = collection(db, "subscriptions");
    const snapshot = await getDocs(subscriptionsCollection);
    
    let success = 0;
    let failed = 0;
    let processed = 0;
    const total = snapshot.docs.length;
    
    for (const doc of snapshot.docs) {
      try {
        const subscriptionData = doc.data();
        
        // Check if subscription already exists in MongoDB
        const existingSubscription = await Subscription.findOne({ _id: doc.id });
        
        if (!existingSubscription) {
          // Create new subscription in MongoDB
          await Subscription.create({
            _id: doc.id,
            userId: subscriptionData.userId,
            packageId: subscriptionData.packageId,
            packageName: subscriptionData.packageName,
            amount: subscriptionData.amount,
            startDate: subscriptionData.startDate?.toDate() || new Date(),
            endDate: subscriptionData.endDate?.toDate() || new Date(),
            status: subscriptionData.status || 'active',
            paymentType: subscriptionData.paymentType || 'recurring'
          });
          success++;
        } else {
          // Update existing subscription
          await Subscription.updateOne(
            { _id: doc.id },
            { $set: subscriptionData }
          );
          success++;
        }
      } catch (error) {
        console.error(`Failed to migrate subscription ${doc.id}:`, error);
        failed++;
      }
      
      processed++;
      if (progressCallback) {
        progressCallback(processed / total);
      }
    }
    
    return { success, failed };
  } catch (error) {
    console.error("Failed to migrate subscriptions:", error);
    return { success: 0, failed: 0 };
  }
};

/**
 * Migrates businesses from Firestore to MongoDB
 */
export const migrateBusinessesFromFirestore = async (progressCallback?: (progress: number) => void): Promise<{ success: number; failed: number }> => {
  try {
    const businessesCollection = collection(db, "businesses");
    const snapshot = await getDocs(businessesCollection);
    
    let success = 0;
    let failed = 0;
    let processed = 0;
    const total = snapshot.docs.length;
    
    for (const doc of snapshot.docs) {
      try {
        const businessData = doc.data();
        
        // Check if business already exists in MongoDB
        const existingBusiness = await Business.findOne({ _id: doc.id });
        
        if (!existingBusiness) {
          // Create new business in MongoDB
          await Business.create({
            _id: doc.id,
            ...businessData,
            createdAt: businessData.createdAt?.toDate() || new Date(),
            updatedAt: businessData.updatedAt?.toDate() || new Date()
          });
          success++;
        } else {
          // Update existing business
          await Business.updateOne(
            { _id: doc.id },
            { 
              $set: {
                ...businessData,
                updatedAt: new Date()
              } 
            }
          );
          success++;
        }
      } catch (error) {
        console.error(`Failed to migrate business ${doc.id}:`, error);
        failed++;
      }
      
      processed++;
      if (progressCallback) {
        progressCallback(processed / total);
      }
    }
    
    return { success, failed };
  } catch (error) {
    console.error("Failed to migrate businesses:", error);
    return { success: 0, failed: 0 };
  }
};
