
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { User } from '@/types/auth';

export const validatePaymentRequest = (user: User | null, packageData: ISubscriptionPackage): string | null => {
  if (!user) {
    return 'User must be logged in to make a payment';
  }
  
  if (!packageData.id || !packageData.price) {
    return 'Invalid package data: missing required fields';
  }
  
  return null;
};

export const validateCustomerData = (user: User): {
  name: string;
  email: string;
  phone: string;
} => {
  return {
    name: user.fullName || user.name || user.email?.split('@')[0] || 'Customer',
    email: user.email || '',
    phone: user.phone || ''
  };
};
