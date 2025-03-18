
/**
 * Loads the Razorpay script dynamically
 */
export const loadRazorpayScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
      resolve();
    };
    
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      reject(new Error('Failed to load Razorpay script'));
    };
    
    document.body.appendChild(script);
  });
};

// Define Razorpay window interface
declare global {
  interface Window {
    Razorpay: any;
  }
}
