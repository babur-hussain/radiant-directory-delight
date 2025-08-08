import { getSubscriptions, processRecurringPayment, updateSubscriptionAfterRecurringPayment } from './subscriptionService';
import { supabase } from '@/integrations/supabase/client';

// Autopay service for handling recurring payments
export class AutopayService {
  private static instance: AutopayService;
  private isRunning = false;
  private checkInterval: NodeJS.Timeout | null = null;

  static getInstance(): AutopayService {
    if (!AutopayService.instance) {
      AutopayService.instance = new AutopayService();
    }
    return AutopayService.instance;
  }

  // Start the autopay service
  async start() {
    if (this.isRunning) {
      console.log('Autopay service is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting autopay service...');

    // Check for recurring payments every 5 minutes
    this.checkInterval = setInterval(async () => {
      await this.checkRecurringPayments();
    }, 5 * 60 * 1000); // 5 minutes

    // Initial check
    await this.checkRecurringPayments();
  }

  // Stop the autopay service
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('Autopay service stopped');
  }

  // Check for recurring payments that need to be processed
  private async checkRecurringPayments() {
    try {
      console.log('Checking for recurring payments...');

      // Get all active recurring subscriptions
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'active')
        .eq('payment_type', 'recurring')
        .not('next_billing_date', 'is', null);

      if (error) {
        console.error('Error fetching subscriptions for autopay:', error);
        return;
      }

      if (!subscriptions || subscriptions.length === 0) {
        console.log('No recurring subscriptions found');
        return;
      }

      const now = new Date();
      const dueSubscriptions = subscriptions.filter(sub => {
        const nextBilling = new Date(sub.next_billing_date);
        return nextBilling <= now;
      });

      console.log(`Found ${dueSubscriptions.length} subscriptions due for payment`);

      // Process each due subscription
      for (const subscription of dueSubscriptions) {
        await this.processSubscriptionPayment(subscription);
      }
    } catch (error) {
      console.error('Error in checkRecurringPayments:', error);
    }
  }

  // Process payment for a specific subscription
  private async processSubscriptionPayment(subscription: any) {
    try {
      console.log(`Processing payment for subscription ${subscription.id}`);

      // Get user details
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', subscription.user_id)
        .single();

      if (userError || !user) {
        console.error('User not found for subscription:', subscription.id);
        return;
      }

      // Process the recurring payment
      const success = await processRecurringPayment(subscription, user);

      if (success) {
        console.log(`Payment initiated for subscription ${subscription.id}`);
        
        // Update subscription with new billing date
        const nextBillingDate = new Date();
        if (subscription.billing_cycle === 'monthly') {
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        } else {
          nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
        }

        await supabase
          .from('subscriptions')
          .update({
            next_billing_date: nextBillingDate.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.id);

        console.log(`Updated next billing date for subscription ${subscription.id}`);
      } else {
        console.error(`Failed to process payment for subscription ${subscription.id}`);
      }
    } catch (error) {
      console.error(`Error processing subscription ${subscription.id}:`, error);
    }
  }

  // Manual trigger for testing
  async triggerPaymentCheck() {
    await this.checkRecurringPayments();
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      hasInterval: !!this.checkInterval
    };
  }
}

// Export singleton instance
export const autopayService = AutopayService.getInstance();

// Helper function to start autopay service
export const startAutopayService = () => {
  return autopayService.start();
};

// Helper function to stop autopay service
export const stopAutopayService = () => {
  return autopayService.stop();
};

// Helper function to check autopay status
export const getAutopayStatus = () => {
  return autopayService.getStatus();
}; 