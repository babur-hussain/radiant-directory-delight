
import { useToast } from '@/hooks/use-toast';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';

export const createPaymentHandlers = (
  packageData: ISubscriptionPackage,
  toast: ReturnType<typeof useToast>['toast'],
  onSuccess: (response: any) => void,
  onDismiss: () => void,
  onError: (error: any) => void
) => {
  const handleSuccess = (response: any) => {
    console.log("Payment success callback triggered with:", response);
    
    toast({
      title: "Payment Successful",
      description: `Your payment for ${packageData.title} was successful.`,
      variant: "success"
    });
    
    onSuccess(response);
  };
  
  const handleDismiss = () => {
    console.log("Payment modal dismissed by user");
    
    toast({
      title: "Payment Cancelled",
      description: "You cancelled the payment process.",
      variant: "info"
    });
    
    onDismiss();
  };
  
  const handleError = (err: any) => {
    console.error("Payment error:", err);
    
    const errorMessage = err?.error?.description || "There was a problem processing your payment.";
    
    toast({
      title: "Payment Failed",
      description: errorMessage,
      variant: "destructive"
    });
    
    onError(err);
  };
  
  return {
    handleSuccess,
    handleDismiss,
    handleError
  };
};
