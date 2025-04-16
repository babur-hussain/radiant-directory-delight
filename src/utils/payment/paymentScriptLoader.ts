
import { useToast } from '@/hooks/use-toast';
import { loadRazorpayScript, isRazorpayAvailable } from '@/utils/razorpay';

export const loadPaymentScript = async (toast: ReturnType<typeof useToast>['toast']): Promise<boolean> => {
  try {
    const isLoaded = await loadRazorpayScript();
    
    if (!isLoaded) {
      toast({
        title: "Payment Error",
        description: 'Failed to load payment gateway. Please check your internet connection and try again.',
        variant: "destructive"
      });
      return false;
    }
    
    return isRazorpayAvailable();
  } catch (error) {
    console.error('Error loading payment script:', error);
    return false;
  }
};
