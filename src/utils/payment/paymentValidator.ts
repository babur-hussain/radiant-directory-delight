
import { User } from '@/types/auth';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';

/**
 * Validate payment request parameters
 */
export const validatePaymentRequest = (user: User | null, packageData: ISubscriptionPackage): string | null => {
  if (!user) {
    return 'User must be logged in to make a payment';
  }
  
  if (!packageData) {
    return 'Package data is required';
  }
  
  if (!packageData.id) {
    return 'Invalid package ID';
  }
  
  if (!packageData.price || packageData.price <= 0) {
    return 'Invalid package price';
  }
  
  // Success - no validation errors
  return null;
};

/**
 * Validate and sanitize customer data for payment
 */
export const validateCustomerData = (user: User): {
  name: string;
  email: string;
  phone: string;
} => {
  const customerData = {
    name: '',
    email: '',
    phone: ''
  };
  
  // Use available user data with fallbacks
  customerData.name = user.fullName || user.name || user.displayName || user.email?.split('@')[0] || 'Customer';
  customerData.email = user.email || '';
  customerData.phone = user.phone || '';
  
  // Ensure the name is not empty
  if (!customerData.name || customerData.name.trim() === '') {
    customerData.name = 'Customer';
  }
  
  return customerData;
};

/**
 * Calculate total payment amount including setup fee
 */
export const calculateTotalPaymentAmount = (packageData: ISubscriptionPackage): number => {
  const basePrice = packageData.price || 0;
  const setupFee = packageData.setupFee || 0;
  return basePrice + setupFee;
};
