
import { toast } from '@/hooks/use-toast';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { recordReferral } from '@/services/referralService';

export const createPaymentHandlers = (
  packageData: ISubscriptionPackage,
  toast: any,
  onSuccess: (response: any) => void,
  onCancel: () => void,
  onError: (error: any) => void
) => {
  const handleSuccess = async (response: any) => {
    console.log('Payment successful:', response);
    toast({
      title: 'Payment Successful',
      description: `Thank you for subscribing to ${packageData.title}!`,
    });
    
    // Process any referral if present
    if (response.referrerId) {
      try {
        await recordReferral(response.referrerId, packageData.price);
      } catch (err) {
        console.error('Error processing referral:', err);
      }
    }
    
    onSuccess(response);
  };

  const handleDismiss = () => {
    console.log('Payment dismissed by user');
    toast({
      title: 'Payment Cancelled',
      description: 'You cancelled the payment process.',
      variant: 'default',
    });
    onCancel();
  };

  const handleError = (error: any) => {
    console.error('Payment error:', error);
    toast({
      title: 'Payment Failed',
      description: error?.description || error?.message || 'An error occurred during payment.',
      variant: 'destructive',
    });
    onError(error);
  };

  return {
    handleSuccess,
    handleDismiss,
    handleError,
  };
};
