import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CreditCard, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentFallbackProps {
  selectedPackage: any;
  user: any;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
  onBack: () => void;
}

const PaymentFallback: React.FC<PaymentFallbackProps> = ({ 
  selectedPackage, 
  user, 
  onSuccess, 
  onFailure,
  onBack 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleManualPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Create a manual payment record
      const paymentData = {
        packageId: selectedPackage.id,
        amount: selectedPackage.price + (selectedPackage.setupFee || 0),
        packageName: selectedPackage.title,
        userEmail: user.email,
        userName: user.name,
        paymentType: 'manual',
        status: 'pending',
        timestamp: new Date().toISOString()
      };

      // Store payment details for manual processing
      sessionStorage.setItem('manual_payment_details', JSON.stringify(paymentData));
      
      // Show success message
      toast.success('Manual payment request submitted successfully!');
      
      // Call success handler
      onSuccess({ 
        type: 'manual',
        message: 'Payment request submitted for manual processing'
      });
      
    } catch (error) {
      console.error('Manual payment error:', error);
      onFailure(error);
      toast.error('Failed to submit manual payment request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent(`Payment Issue - ${selectedPackage.title}`);
    const body = encodeURIComponent(`
Hi Support Team,

I'm experiencing issues with the PayU payment gateway for the following package:

Package: ${selectedPackage.title}
Amount: ₹${(selectedPackage.price + (selectedPackage.setupFee || 0)).toLocaleString('en-IN')}
User: ${user.name} (${user.email})

The payment gateway is showing "Too many Requests" error. Please help me complete this payment.

Best regards,
${user.name}
    `);
    
    window.open(`mailto:care@payu.in?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="space-y-4">
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center text-orange-800">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Payment Gateway Issue
          </CardTitle>
          <CardDescription className="text-orange-700">
            We're experiencing temporary issues with our payment gateway. Please choose an alternative payment method.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <h4 className="font-medium text-gray-900 mb-2">Payment Details</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Package:</span>
                  <span className="font-medium">{selectedPackage.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-medium">₹{(selectedPackage.price + (selectedPackage.setupFee || 0)).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>User:</span>
                  <span className="font-medium">{user.name}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <Button
                onClick={handleManualPayment}
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isProcessing ? (
                  <>
                    <CreditCard className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Submit Manual Payment Request
                  </>
                )}
              </Button>

              <Button
                onClick={handleContactSupport}
                variant="outline"
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Button>

              <Button
                onClick={onBack}
                variant="ghost"
                className="w-full"
              >
                Back to Payment Options
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              <p>Our support team will contact you within 24 hours to complete your payment.</p>
              <p className="mt-1">You can also call us at: <a href="tel:+91-XXXXXXXXXX" className="text-blue-600 hover:underline">+91-XXXXXXXXXX</a></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFallback;
