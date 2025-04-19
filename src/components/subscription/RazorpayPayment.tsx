
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRazorpayPayment } from '@/hooks/useRazorpayPayment';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { useAuth } from '@/hooks/useAuth';
import { createSubscription } from '@/services/subscriptionService';
import { updateUserSubscription } from '@/lib/subscription/update-subscription';
import { updateUserSubscriptionDetails } from '@/lib/mongodb/userUtils';
import { useToast } from '@/hooks/use-toast';
import { SubscriptionStatus } from '@/models/Subscription';
import { RazorpayResponse } from '@/types/razorpay';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface RazorpayPaymentProps {
  selectedPackage: ISubscriptionPackage;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({ 
  selectedPackage, 
  onSuccess, 
  onFailure 
}) => {
  const { initiatePayment, isLoading, error } = useRazorpayPayment();
  const { user, refreshUserData } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const referralId = searchParams.get('ref');
  
  useEffect(() => {
    // Initiate payment automatically when component mounts
    handlePayNow();
  }, []);
  
  const handlePayNow = async () => {
    console.log("Initiating payment for package:", selectedPackage);
    
    // Calculate total amount including setup fee
    const totalAmount = (selectedPackage.price || 0) + (selectedPackage.setupFee || 0);
    console.log(`Payment amount: ${selectedPackage.price} + Setup fee: ${selectedPackage.setupFee} = Total: ${totalAmount}`);
    
    // Make a copy of the package with the updated price that includes setup fee
    const packageWithSetupFee = {
      ...selectedPackage,
      totalAmount: totalAmount // Add this for reference
    };
    
    try {
      // Pass the modified package that includes setup fee
      await initiatePayment(packageWithSetupFee, true)
        .then(async (response: RazorpayResponse) => {
          console.log("Payment successful:", response);
          
          // Critical: Add non-refundable and non-cancellable flags for all payments
          const enhancedResponse = {
            ...response,
            // All payments are non-refundable
            isRefundable: false,
            autoRefund: false,
            // Only recurring payments can be cancelled, never one-time payments
            isCancellable: selectedPackage.paymentType !== 'one-time',
            // Ensure autopay is disabled for one-time payments
            enableAutoPay: selectedPackage.paymentType !== 'one-time',
            // Add additional flags to ensure payments stick
            paymentType: selectedPackage.paymentType,
            isNonRefundable: true,
            refundBlocked: true
          };

          // Check if user exists before trying to store subscription data
          if (user && user.id) {
            try {
              // Calculate subscription start/end dates
              const startDate = new Date().toISOString();
              const endDate = new Date();
              
              // For one-time payments, set end date based on package duration
              if (selectedPackage.paymentType === 'one-time' && selectedPackage.durationMonths) {
                endDate.setMonth(endDate.getMonth() + selectedPackage.durationMonths);
              } 
              // For recurring payments with yearly billing
              else if (selectedPackage.billingCycle === 'yearly') {
                endDate.setFullYear(endDate.getFullYear() + 1);
              } 
              // Default to monthly for recurring
              else {
                endDate.setMonth(endDate.getMonth() + 1);
              }

              // Create a unique subscription ID
              const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

              // Create subscription in Supabase - using snake_case for column names
              const subscriptionData = {
                id: subscriptionId,
                user_id: user.id,
                package_id: selectedPackage.id,
                package_name: selectedPackage.title,
                amount: totalAmount, // Use the total amount including setup fee
                start_date: startDate,
                end_date: endDate.toISOString(),
                status: 'active',
                payment_method: 'razorpay',
                transaction_id: response.razorpay_payment_id || '',
                payment_type: selectedPackage.paymentType,
                billing_cycle: selectedPackage.billingCycle,
                signup_fee: selectedPackage.setupFee || 0,
                recurring_amount: selectedPackage.price,
                razorpay_subscription_id: response.subscription_id || '',
                // For one-time payments, explicitly set as non-cancellable
                is_pausable: selectedPackage.paymentType !== 'one-time',
                is_user_cancellable: selectedPackage.paymentType !== 'one-time',
                advance_payment_months: selectedPackage.advancePaymentMonths || 0,
                actual_start_date: startDate,
                // Add referral information if available
                referrer_id: referralId || null
              };

              // First create the subscription record in user_subscriptions table
              const { data: subscriptionRecord, error: subscriptionError } = await supabase
                .from('user_subscriptions')
                .insert(subscriptionData)
                .select()
                .single();
                
              if (subscriptionError) {
                console.error("Error inserting subscription record:", subscriptionError);
                throw subscriptionError;
              }
              
              console.log("Subscription record created:", subscriptionRecord);
              
              // Then attempt to create subscription via service (extra redundancy)
              // Convert to camelCase for the service
              const camelCaseData = {
                id: subscriptionId,
                userId: user.id,
                packageId: selectedPackage.id,
                packageName: selectedPackage.title,
                amount: totalAmount,
                startDate: startDate,
                endDate: endDate.toISOString(),
                status: 'active' as SubscriptionStatus,
                paymentMethod: 'razorpay',
                transactionId: response.razorpay_payment_id || '',
                paymentType: selectedPackage.paymentType,
                billingCycle: selectedPackage.billingCycle,
                signupFee: selectedPackage.setupFee || 0,
                recurringAmount: selectedPackage.price,
                razorpaySubscriptionId: response.subscription_id || '',
                isPausable: selectedPackage.paymentType !== 'one-time',
                isUserCancellable: selectedPackage.paymentType !== 'one-time',
                advancePaymentMonths: selectedPackage.advancePaymentMonths || 0,
                actualStartDate: startDate
              };
              
              try {
                await createSubscription(camelCaseData);
                console.log("Subscription created via service successfully");
              } catch(err) {
                console.log("Secondary subscription creation failed, using primary method", err);
              }
              
              try {
                // Update user subscription via lib function (first attempt)
                const updateResult = await updateUserSubscription(user.id, camelCaseData);
                console.log("updateUserSubscription result:", updateResult);
              } catch(err) {
                console.log("updateUserSubscription failed, trying direct update", err);
              }
              
              // Use our new utility to ensure user profile is updated with subscription details
              // This is a reliable backup method if the other methods fail
              try {
                const userUpdateResult = await updateUserSubscriptionDetails(
                  user.id,
                  subscriptionId,
                  selectedPackage.id,
                  'active'
                );
                console.log("Direct user profile update result:", userUpdateResult);
              } catch (err) {
                console.error("Failed to update user profile with subscription details:", err);
              }
              
              // Additionally update user record directly for ultimate redundancy
              const { data: userData, error: userUpdateError } = await supabase
                .from('users')
                .update({
                  subscription: subscriptionId,
                  subscription_id: subscriptionId,
                  subscription_status: 'active',
                  subscription_package: selectedPackage.id,
                  // Add additional fields to ensure proper tracking
                  has_active_subscription: true,
                  subscription_start_date: startDate,
                  subscription_end_date: endDate.toISOString()
                })
                .eq('id', user.id)
                .select();
                
              if (userUpdateError) {
                console.error("Error updating user record:", userUpdateError);
                // Don't throw here, just log as we have multiple layers of redundancy
              } else {
                console.log("User record updated with subscription:", userData);
              }
              
              // Process referral if referralId is provided
              if (referralId) {
                try {
                  const { data: refData, error: refError } = await supabase.rpc(
                    'record_referral', 
                    { 
                      referrer_id: referralId, 
                      earning_amount: totalAmount * 0.1 // 10% commission
                    }
                  );
                  
                  if (!refError && refData) {
                    toast({
                      title: "Referral Applied",
                      description: "Your referrer will be credited for this subscription.",
                    });
                  } else if (refError) {
                    console.error("Referral processing error:", refError);
                  }
                } catch (refErr) {
                  console.error("Failed to process referral:", refErr);
                }
              }
              
              toast({
                title: "Subscription Activated",
                description: `Your ${selectedPackage.title} package has been activated successfully!`,
              });
              
              // Refresh user data to update UI with new subscription status
              await refreshUserData();
              
            } catch (err) {
              console.error("Failed to store subscription:", err);
              // Even if storage fails, try a direct update to user record
              try {
                await supabase
                  .from('users')
                  .update({ 
                    subscription_status: 'active',
                    subscription_package: selectedPackage.id,
                    has_active_subscription: true
                  })
                  .eq('id', user.id);
              } catch (fallbackErr) {
                console.error("Failed fallback update:", fallbackErr);
              }
              
              toast({
                title: "Warning",
                description: "Payment successful, but we had trouble activating your subscription. Please contact support.",
                variant: "destructive"
              });
            }
          }
          
          onSuccess(enhancedResponse);
        })
        .catch((err) => {
          console.error("Payment failed:", err);
          onFailure(err);
        });
    } catch (err) {
      console.error("Error initiating payment:", err);
      onFailure(err);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">
          {isLoading ? "Processing Payment..." : "Payment Gateway"}
        </h3>
        <p className="text-gray-600 text-sm">
          {isLoading 
            ? "Please wait while we redirect you to the payment gateway."
            : "Click the button below to proceed with payment."
          }
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <p className="font-medium">Payment Error</p>
          <p className="text-sm">{error}</p>
          <p className="text-sm mt-2">Please try again or contact support if the issue persists.</p>
        </div>
      )}
      
      <div className="flex justify-center">
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span>Opening payment gateway...</span>
          </div>
        ) : (
          <Button onClick={handlePayNow} className="w-full sm:w-auto">
            Pay Now
          </Button>
        )}
      </div>
      
      <div className="text-center text-sm text-gray-500">
        <p>You will be redirected to Razorpay's secure payment gateway.</p>
        <p className="mt-1">Payment is processed securely by Razorpay.</p>
        <p className="mt-1 font-medium text-rose-600">Note: All payments are non-refundable.</p>
      </div>
    </div>
  );
};

export default RazorpayPayment;
