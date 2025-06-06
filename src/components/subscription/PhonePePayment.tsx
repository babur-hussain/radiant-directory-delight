
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CreditCard, Shield, CheckCircle2 } from 'lucide-react';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { usePhonePePayment } from '@/hooks/usePhonePePayment';

interface PhonePePaymentProps {
  selectedPackage: ISubscriptionPackage;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
  referralId?: string | null;
}

const PhonePePayment: React.FC<PhonePePaymentProps> = ({
  selectedPackage,
  onSuccess,
  onFailure,
  referralId
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { initiatePayment } = usePhonePePayment();

  const totalAmount = selectedPackage.price + (selectedPackage.setupFee || 0);

  const handlePayment = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to continue with payment.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Store payment details for success page
      sessionStorage.setItem('phonepe_payment_details', JSON.stringify({
        packageId: selectedPackage.id,
        amount: totalAmount,
        packageName: selectedPackage.title
      }));

      // Initiate PhonePe payment - this will redirect to PhonePe
      await initiatePayment(selectedPackage);
      
    } catch (error) {
      console.error('Payment initiation failed:', error);
      setIsProcessing(false);
      onFailure({
        message: error instanceof Error ? error.message : 'Payment processing failed'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-800">
            <CreditCard className="h-5 w-5 mr-2" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Package:</span>
            <span className="font-semibold">{selectedPackage.title}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Package Price:</span>
            <span>₹{selectedPackage.price.toLocaleString('en-IN')}</span>
          </div>
          {selectedPackage.setupFee && selectedPackage.setupFee > 0 && (
            <div className="flex justify-between items-center">
              <span>Setup Fee:</span>
              <span>₹{selectedPackage.setupFee.toLocaleString('en-IN')}</span>
            </div>
          )}
          <hr className="border-blue-200" />
          <div className="flex justify-between items-center font-bold text-lg">
            <span>Total Amount:</span>
            <span className="text-blue-700">₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="text-sm text-blue-600">
            Billing: {selectedPackage.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
          </div>
          {referralId && (
            <div className="text-xs bg-green-100 text-green-700 p-2 rounded border border-green-200">
              ✨ Referral applied! Your friend will receive benefits.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Processing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-green-600" />
            Secure Payment with PhonePe
          </CardTitle>
          <CardDescription>
            Your payment is secured and encrypted. Click below to proceed with PhonePe payment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Redirecting to PhonePe...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay ₹{totalAmount.toLocaleString('en-IN')} with PhonePe
              </>
            )}
          </Button>
          <p className="text-xs text-center text-gray-500 mt-3">
            You will be redirected to PhonePe for secure payment processing.
          </p>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="text-center">
        <div className="inline-flex items-center text-sm text-gray-600">
          <Shield className="h-4 w-4 mr-1 text-green-600" />
          <span>Secured by 256-bit SSL encryption</span>
        </div>
      </div>
    </div>
  );
};

export default PhonePePayment;
