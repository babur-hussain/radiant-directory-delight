
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
    
    // Save subscription to MongoDB
    console.log(`Attempting to save subscription ${subscriptionId} to MongoDB for user ${userId}`);
    
    // Update or create the subscription in MongoDB
    await fetch('http://localhost:3001/api/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });
    
    console.log(`Subscription ${subscriptionId} assigned to user ${userId}`);
    return true;
  } catch (error) {
    console.error("Error assigning subscription:", error);
    return false;
  }
};

export const adminCancelSubscription = async (userId: string, subscriptionId: string): Promise<boolean> => {
  try {
    if (!userId || !subscriptionId) {
      console.error("Invalid user ID or subscription ID");
      return false;
    }
    
    // Get the subscription
    const response = await fetch(`http://localhost:3001/api/subscriptions/user/${userId}`);
    if (!response.ok) {
      console.error("No subscription found for this user");
      return false;
    }
    
    const subscription = await response.json();
    
    // Update subscription with cancelled status
    const updatedSubscription = {
      ...subscription,
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
      cancelReason: "admin_cancelled",
      updatedAt: new Date()
    };
    
    // Save updated subscription
    await fetch('http://localhost:3001/api/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedSubscription),
    });
    
    console.log(`Subscription ${subscriptionId} cancelled for user ${userId}`);
    return true;
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return false;
  }
};
