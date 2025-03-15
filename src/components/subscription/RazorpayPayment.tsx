
import React from 'react';
import { Loader2 } from 'lucide-react';
import { SubscriptionPackage } from '@/data/subscriptionData';
import { useRazorpay } from '@/hooks/useRazorpay';

interface RazorpayPaymentProps {
  selectedPackage: SubscriptionPackage;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

const RazorpayPayment = ({ 
  selectedPackage, 
  onSuccess, 
  onFailure 
}: RazorpayPaymentProps) => {
  const { isLoading, scriptLoaded } = useRazorpay({
    selectedPackage,
    onSuccess,
    onFailure
  });
  
  return (
    <div className="flex flex-col items-center justify-center p-6">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        {!scriptLoaded 
          ? "Loading payment gateway..." 
          : "Preparing payment gateway..."}
      </p>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Please wait while we connect to our secure payment system
      </p>
    </div>
  );
};

export default RazorpayPayment;
