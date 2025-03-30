
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRazorpayPayment } from '@/hooks/useRazorpayPayment';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { useAuth } from '@/hooks/useAuth';
import { createSubscription } from '@/services/subscriptionService';
import { updateUserSubscription } from '@/lib/subscription/update-subscription';
import { useToast } from '@/hooks/use-toast';

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
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    // Initiate payment automatically when component mounts
    handlePayNow();
  }, []);
  
  const handlePayNow = async () => {
    console.log("Initiating payment for package:", selectedPackage);
    
    try {
      await initiatePayment({
        selectedPackage,
        onSuccess: async (response) => {
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

              // Create subscription in Supabase
              const subscriptionData = {
                id: `sub_${Date.now()}`,
                userId: user.id,
                packageId: selectedPackage.id,
                packageName: selectedPackage.title,
                amount: selectedPackage.price,
                startDate: startDate,
                endDate: endDate.toISOString(),
                status: 'active',
                paymentMethod: 'razorpay',
                transactionId: response.razorpay_payment_id || '',
                paymentType: selectedPackage.paymentType,
                billingCycle: selectedPackage.billingCycle,
                signupFee: selectedPackage.setupFee || 0,
                recurringAmount: selectedPackage.price,
                razorpaySubscriptionId: response.subscription_id || '',
                // For one-time payments, explicitly set as non-cancellable
                isPausable: selectedPackage.paymentType !== 'one-time',
                isUserCancellable: selectedPackage.paymentType !== 'one-time',
                advancePaymentMonths: selectedPackage.advancePaymentMonths || 0,
                actualStartDate: startDate
              };

              await createSubscription(subscriptionData);
              
              // Also update the user record with subscription details
              await updateUserSubscription(user.id, subscriptionData);
              
              toast({
                title: "Subscription Activated",
                description: `Your ${selectedPackage.title} package has been activated successfully!`,
              });
            } catch (err) {
              console.error("Failed to store subscription:", err);
              toast({
                title: "Warning",
                description: "Payment successful, but we had trouble activating your subscription. Please contact support.",
                variant: "destructive"
              });
            }
          }
          
          onSuccess(enhancedResponse);
        },
        onFailure: (err) => {
          console.error("Payment failed:", err);
          onFailure(err);
        }
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
