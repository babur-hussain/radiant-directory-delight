
import { useToast } from '@/hooks/use-toast';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';

/**
 * Create event handlers for payment process
 */
export const createPaymentHandlers = (
  packageData: ISubscriptionPackage,
  toastFn: any,
  onSuccessCallback: (response: any) => void,
  onDismissCallback: () => void,
  onErrorCallback: (error: any) => void
) => {
  return {
    handleSuccess: (response: any) => {
      console.log("Payment success handler triggered with:", response);
      
      // Calculate total amount including setup fee
      const totalAmount = packageData.price + (packageData.setupFee || 0);
      console.log(`Successful payment for ${packageData.title} - Amount: ${totalAmount}`);
      
      // Add critical flags to prevent refunds
      const enrichedResponse = {
        ...response,
        packageDetails: packageData,
        amount: totalAmount * 100, // Convert to paise
        isNonRefundable: true,
        preventRefunds: true,
        autoRefund: false,
        // Include setup fee information
        setupFee: packageData.setupFee || 0,
        basePrice: packageData.price,
        totalAmount: totalAmount
      };
      
      // Notify success
      try {
        toastFn({
          title: "Payment Successful",
          description: `Your payment for ${packageData.title} was successful`,
          variant: "success"
        });
      } catch (error) {
        console.error("Error showing success toast:", error);
      }
      
      // Call success callback
      onSuccessCallback(enrichedResponse);
    },
    
    handleDismiss: () => {
      console.log("Payment dismissed by user");
      
      try {
        toastFn({
          title: "Payment Cancelled",
          description: "You cancelled the payment process",
          variant: "info"
        });
      } catch (error) {
        console.error("Error showing dismiss toast:", error);
      }
      
      onDismissCallback();
    },
    
    handleError: (error: any) => {
      console.error("Payment error:", error);
      let errorMessage = "There was an error processing your payment";
      
      if (error && error.error) {
        errorMessage = error.error.description || errorMessage;
      }
      
      try {
        toastFn({
          title: "Payment Failed",
          description: errorMessage,
          variant: "destructive"
        });
      } catch (err) {
        console.error("Error showing error toast:", err);
      }
      
      onErrorCallback(error);
    }
  };
};
