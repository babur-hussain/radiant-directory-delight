
import { Subscription, ISubscription } from '../../models/Subscription';
import { User } from '../../models/User';

export const adminAssignSubscription = async (userId: string, subscriptionData: any): Promise<boolean> => {
  try {
    if (!userId) {
      console.error("Invalid user ID");
      return false;
    }
    
    // Generate a unique subscription ID if not provided
    const subscriptionId = subscriptionData.id || `sub_${Date.now()}`;
    
    // Prepare subscription data
    const subscription: ISubscription = {
      id: subscriptionId,
      userId: userId,
      packageId: subscriptionData.packageId || subscriptionData.id,
      packageName: subscriptionData.packageName || subscriptionData.title,
      amount: subscriptionData.amount || subscriptionData.price,
      startDate: subscriptionData.startDate || new Date().toISOString(),
      endDate: subscriptionData.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      status: subscriptionData.status || "active",
      createdAt: new Date(),
      updatedAt: new Date(),
      assignedBy: subscriptionData.assignedBy || "admin",
      assignedAt: subscriptionData.assignedAt || new Date().toISOString(),
      advancePaymentMonths: subscriptionData.advancePaymentMonths || 0,
      signupFee: subscriptionData.signupFee || 0,
      actualStartDate: subscriptionData.actualStartDate || new Date().toISOString(),
      isPaused: subscriptionData.isPaused || false,
      isPausable: subscriptionData.isPausable !== undefined ? subscriptionData.isPausable : true,
      isUserCancellable: subscriptionData.isUserCancellable !== undefined ? subscriptionData.isUserCancellable : true,
      invoiceIds: subscriptionData.invoiceIds || [],
      paymentType: subscriptionData.paymentType || "recurring" // Default to recurring if not specified
    };
    
    // Save to MongoDB with better logging
    console.log(`Attempting to save subscription ${subscriptionId} to MongoDB for user ${userId}`, subscription);
    
    // Update or create the subscription
    await Subscription.findOneAndUpdate(
      { id: subscriptionId },
      subscription,
      { upsert: true, new: true }
    );
    
    // Also update the user's subscription reference
    await User.findOneAndUpdate(
      { uid: userId },
      { 
        subscription: subscriptionId,
        $set: {
          'subscriptionStatus': subscription.status,
          'subscriptionPackage': subscription.packageId
        }
      },
      { new: true }
    );
    
    console.log(`Subscription ${subscriptionId} assigned to user ${userId}`);
    return true;
  } catch (error) {
    console.error("Error assigning subscription:", error);
    return false;
  }
};

// Adding this function to maintain compatibility with the existing code
export const adminCancelSubscription = async (userId: string, subscriptionId: string): Promise<boolean> => {
  try {
    if (!userId || !subscriptionId) {
      console.error("Invalid user ID or subscription ID");
      return false;
    }
    
    // Update the subscription with cancelled status
    await Subscription.findOneAndUpdate(
      { id: subscriptionId },
      {
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
        cancelReason: "admin_cancelled",
        updatedAt: new Date()
      }
    );
    
    // Also update the user's subscription status
    await User.findOneAndUpdate(
      { uid: userId },
      { 
        $set: {
          'subscriptionStatus': 'cancelled',
          'subscriptionCancelledAt': new Date()
        }
      }
    );
    
    console.log(`Subscription ${subscriptionId} cancelled for user ${userId}`);
    return true;
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return false;
  }
};
