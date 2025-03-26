
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayButtonProps {
  packageData: ISubscriptionPackage;
  onSuccess?: () => void;
  onFailure?: (error: any) => void;
  buttonText?: string;
  className?: string;
  disabled?: boolean;
}

const RazorpayButton: React.FC<RazorpayButtonProps> = ({
  packageData,
  onSuccess,
  onFailure,
  buttonText = 'Pay Now',
  className = '',
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { purchaseSubscription } = useSubscription(user?.uid);
  
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };
  
  const displayRazorpay = async () => {
    setIsLoading(true);
    
    try {
      const res = await loadRazorpayScript();
      
      if (!res) {
        toast({
          title: "Error",
          description: "Razorpay SDK failed to load. Please check your internet connection.",
          variant: "destructive"
        });
        return;
      }
      
      // For this demo, we'll skip the actual payment flow
      // and directly call the success handler
      
      // In a real implementation, you would:
      // 1. Create an order on your server
      // 2. Initialize Razorpay with order details
      // 3. Handle payment success/failure
      
      // Demo success
      try {
        // Directly create the subscription
        const subscription = await purchaseSubscription(packageData);
        toast({
          title: "Subscription Activated",
          description: `Successfully subscribed to ${packageData.title}`,
        });
        if (onSuccess) onSuccess();
      } catch (error) {
        console.error("Subscription creation failed:", error);
        if (onFailure) onFailure(error);
      }
    } catch (error) {
      console.error("Razorpay error:", error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
      if (onFailure) onFailure(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      onClick={displayRazorpay}
      className={className}
      disabled={disabled || isLoading}
    >
      {isLoading ? "Processing..." : buttonText}
    </Button>
  );
};

export default RazorpayButton;
