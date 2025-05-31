
import { createSubscription } from '@/services/subscriptionService';

export const adminAssignPhonePeSubscription = async (
  userId: string,
  packageData: any,
  paymentResponse: any
): Promise<boolean> => {
  try {
    console.log('Creating PhonePe subscription for user:', userId);
    console.log('Package data:', packageData);
    console.log('Payment response:', paymentResponse);

    // Create subscription data
    const subscriptionData = {
      userId: userId,
      packageId: packageData.id,
      packageName: packageData.title || 'Subscription Package',
      amount: packageData.price + (packageData.setupFee || 0),
      paymentType: packageData.paymentType || 'recurring' as const,
      billingCycle: packageData.billingCycle || 'monthly' as const,
      transactionId: paymentResponse.merchantTransactionId || paymentResponse.transactionId,
      paymentMethod: 'PhonePe',
      status: 'active' as const,
      recurringAmount: packageData.price,
      signupFee: packageData.setupFee || 0
    };

    console.log('Creating subscription with data:', subscriptionData);
    
    const newSubscription = await createSubscription(subscriptionData);
    
    console.log('Subscription created successfully:', newSubscription);
    return true;

  } catch (error) {
    console.error('Failed to create PhonePe subscription:', error);
    return false;
  }
};
