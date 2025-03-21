
import { ISubscription } from '../../models/Subscription';
import { User } from '../../models/User';
import { supabase } from '@/integrations/supabase/client';

export const adminAssignSubscription = async (userId: string, subscriptionData: any): Promise<boolean> => {
  try {
    if (!userId) {
      console.error("Invalid user ID");
      return false;
    }
    
    // Generate a unique subscription ID if not provided
    const subscriptionId = subscriptionData.id || `sub_${Date.now()}`;
    
    // Prepare subscription data
    const subscription: Partial<ISubscription> = {
      id: subscriptionId,
      userId: userId,
      packageId: subscriptionData.packageId || subscriptionData.id,
      packageName: subscriptionData.packageName || subscriptionData.title,
      amount: subscriptionData.amount || subscriptionData.price,
      startDate: subscriptionData.startDate || new Date().toISOString(),
      endDate: subscriptionData.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      status: subscriptionData.status || "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
    
    // Prepare data for Supabase (snake_case)
    const supabaseData = {
      id: subscription.id,
      user_id: subscription.userId,
      package_id: subscription.packageId,
      package_name: subscription.packageName,
      amount: subscription.amount,
      start_date: subscription.startDate,
      end_date: subscription.endDate,
      status: subscription.status,
      created_at: subscription.createdAt,
      updated_at: subscription.updatedAt,
      assigned_by: subscription.assignedBy,
      assigned_at: subscription.assignedAt,
      advance_payment_months: subscription.advancePaymentMonths,
      signup_fee: subscription.signupFee,
      actual_start_date: subscription.actualStartDate,
      is_paused: subscription.isPaused,
      is_pausable: subscription.isPausable,
      is_user_cancellable: subscription.isUserCancellable,
      invoice_ids: subscription.invoiceIds,
      payment_type: subscription.paymentType
    };
    
    // Save to Supabase
    const { error } = await supabase
      .from('user_subscriptions')
      .upsert([supabaseData]);
    
    if (error) {
      console.error("Error saving subscription:", error);
      return false;
    }
    
    // Update user record
    const { error: userError } = await supabase
      .from('users')
      .update({
        subscription: subscription.id,
        subscription_id: subscription.id,
        subscription_status: subscription.status,
        subscription_package: subscription.packageId
      })
      .eq('id', userId);
    
    if (userError) {
      console.error("Error updating user with subscription:", userError);
      return false;
    }
    
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
    const { data: subscription, error: getError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .maybeSingle();
    
    if (getError || !subscription) {
      console.error("No subscription found with this ID:", getError);
      return false;
    }
    
    // Update subscription with cancelled status
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        status: "cancelled",
        cancelled_at: now,
        cancel_reason: "admin_cancelled",
        updated_at: now
      })
      .eq('id', subscriptionId);
    
    if (updateError) {
      console.error("Error updating subscription:", updateError);
      return false;
    }
    
    // Update user record
    const { error: userError } = await supabase
      .from('users')
      .update({
        subscription_status: "cancelled"
      })
      .eq('id', userId);
    
    if (userError) {
      console.error("Error updating user subscription status:", userError);
      return false;
    }
    
    console.log(`Subscription ${subscriptionId} cancelled for user ${userId}`);
    return true;
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return false;
  }
};
