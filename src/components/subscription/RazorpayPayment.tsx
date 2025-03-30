
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRazorpayPayment } from '@/hooks/useRazorpayPayment';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';

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
  
  useEffect(() => {
    // Initiate payment automatically when component mounts
    handlePayNow();
  }, []);
  
  const handlePayNow = async () => {
    console.log("Initiating payment for package:", selectedPackage);
    
    try {
      await initiatePayment({
        selectedPackage,
        onSuccess: (response) => {
          console.log("Payment successful:", response);
          
          // Add non-refundable flags to payment response
          const enhancedResponse = {
            ...response,
            isRefundable: false,
            // Set cancellable based on payment type
            isCancellable: selectedPackage.paymentType !== 'one-time'
          };
          
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
      </div>
    </div>
  );
};

export default RazorpayPayment;
