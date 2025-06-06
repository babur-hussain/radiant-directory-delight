
/**
 * Payment validation functions
 */

export const validatePaymentRequest = (user: any, packageData: any): string | null => {
  if (!user) {
    return "User authentication required for payment";
  }
  
  if (!packageData) {
    return "Package details are required";
  }
  
  if (!packageData.id) {
    return "Invalid package: missing ID";
  }
  
  if (!packageData.price && packageData.price !== 0) {
    return "Invalid package: missing price";
  }
  
  if (!packageData.title) {
    return "Invalid package: missing title";
  }
  
  return null; // No errors
};

export const validateCustomerData = (user: any) => {
  const customerData = {
    name: user.fullName || user.name || user.email?.split('@')[0] || 'Customer',
    email: user.email || '',
    phone: user.phone || ''
  };
  
  // Clean empty values
  Object.keys(customerData).forEach(key => {
    // @ts-ignore
    if (!customerData[key]) {
      // @ts-ignore
      delete customerData[key];
    }
  });
  
  return customerData;
};
