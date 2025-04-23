
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';

/**
 * Create standardized payment event handlers for consistency
 */
export const createPaymentHandlers = (
  packageData: any,
  toastFunction: any,
  onSuccess: (response: any) => void,
  onDismiss: () => void,
  onError: (error: any) => void
) => {
  return {
    handleSuccess: (response: any) => {
      try {
        console.log("Payment success:", response);
        toast('Payment successful! Your subscription has been activated.');
        
        // Add package data for convenience
        const fullResponse = {
          ...response,
          package: packageData
        };
        
        onSuccess(fullResponse);
      } catch (err) {
        console.error("Error in success handler:", err);
        onError(err);
      }
    },
    
    handleDismiss: () => {
      console.log("Payment modal dismissed by user");
      toast('Payment cancelled');
      onDismiss();
    },
    
    handleError: (error: any) => {
      console.error("Payment error:", error);
      
      let errorMessage = "Payment failed";
      if (error && error.description) {
        errorMessage = error.description;
      } else if (error && typeof error === 'string') {
        errorMessage = error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast(`Payment error: ${errorMessage}`);
      onError(error);
    }
  };
};
