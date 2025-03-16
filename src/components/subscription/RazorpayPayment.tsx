
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CreditCard, Shield } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SubscriptionPackage } from '@/data/subscriptionData';
import { loadRazorpayScript } from '@/lib/razorpay-utils';
import { useAuth } from '@/hooks/useAuth';

interface RazorpayPaymentProps {
  selectedPackage: SubscriptionPackage;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({ 
  selectedPackage, 
  onSuccess, 
  onFailure 
}) => {
  const { user } = useAuth();
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  
  // Determine if this is a one-time package
  const isOneTimePackage = selectedPackage.paymentType === "one-time";
  
  // Calculate the amount based on payment type
  const paymentAmount = isOneTimePackage 
    ? selectedPackage.price 
    : (selectedPackage.setupFee || 0);
  
  useEffect(() => {
    const loadScript = async () => {
      try {
        await loadRazorpayScript();
        setIsScriptLoaded(true);
      } catch (error) {
        setScriptError('Failed to load payment gateway. Please try again later.');
        console.error('Error loading Razorpay script:', error);
      }
    };
    
    loadScript();
  }, []);
  
  const handlePayment = () => {
    if (!window.Razorpay) {
      setScriptError('Payment gateway is not available. Please try again later.');
      return;
    }
    
    if (!user) {
      onFailure(new Error('User authentication required'));
      return;
    }
    
    // Create a mock order for demonstration
    // In a real app, this would come from your backend
    const order = {
      id: `order_${Date.now()}`,
      amount: paymentAmount * 100, // Amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };
    
    const options = {
      key: 'rzp_test_1DP5mmOlF5G5ag', // Replace with your actual key
      amount: order.amount,
      currency: order.currency,
      name: 'Grow Bharat Vyapaar',
      description: `Payment for ${selectedPackage.title}`,
      order_id: order.id,
      handler: function(response: any) {
        // Add payment type to the response
        response.paymentType = selectedPackage.paymentType || "recurring";
        onSuccess(response);
      },
      prefill: {
        name: user.displayName || user.name || '',
        email: user.email || '',
        contact: user.phone || ''
      },
      notes: {
        package_id: selectedPackage.id,
        package_type: selectedPackage.type,
        payment_type: selectedPackage.paymentType || "recurring"
      },
      theme: {
        color: '#2563EB'
      },
      modal: {
        ondismiss: function() {
          console.log('Payment modal dismissed');
        }
      }
    };
    
    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error opening Razorpay:', error);
      onFailure(error);
    }
  };
  
  if (scriptError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Payment Error</AlertTitle>
        <AlertDescription>{scriptError}</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-lg">Payment Summary</CardTitle>
        <CardDescription>Review your payment details</CardDescription>
      </CardHeader>
      <CardContent className="px-0 space-y-4">
        <div className="border rounded-md p-4 space-y-3">
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">{selectedPackage.title}</span>
            <span className="font-medium">
              {isOneTimePackage 
                ? `₹${selectedPackage.price}` 
                : `₹${selectedPackage.setupFee || 0}`}
            </span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {isOneTimePackage ? (
              <p>One-time payment for {selectedPackage.durationMonths || 12} months of service</p>
            ) : (
              <>
                <p>Initial setup fee payment</p>
                <p className="mt-1">Your subscription will begin after this payment is processed.</p>
              </>
            )}
          </div>
          
          <div className="flex justify-between pt-2 font-medium text-primary">
            <span>Total Amount</span>
            <span>₹{paymentAmount}</span>
          </div>
        </div>
        
        <div className="flex items-start gap-2 bg-muted p-3 rounded-md">
          <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Secure Payment</p>
            <p className="text-muted-foreground">Your payment information is processed securely by Razorpay.</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-0 pt-2 flex flex-col space-y-2">
        <Button 
          onClick={handlePayment} 
          className="w-full" 
          disabled={!isScriptLoaded}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          {isOneTimePackage 
            ? `Pay ₹${selectedPackage.price}` 
            : `Pay ₹${selectedPackage.setupFee || 0}`}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          By proceeding, you agree to our Terms of Service and Privacy Policy
        </p>
      </CardFooter>
    </Card>
  );
};

export default RazorpayPayment;
