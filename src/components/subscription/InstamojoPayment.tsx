import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CreditCard, Shield, CheckCircle2 } from 'lucide-react';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useInstamojoPayment } from '@/hooks/useInstamojoPayment';

interface InstamojoPaymentProps {
  selectedPackage: ISubscriptionPackage;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
  referralId?: string | null;
}

const InstamojoPayment: React.FC<InstamojoPaymentProps> = ({
  selectedPackage,
  onSuccess,
  onFailure,
  referralId
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { initiatePayment } = useInstamojoPayment();

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
      sessionStorage.setItem('instamojo_payment_details', JSON.stringify({
        packageId: selectedPackage.id,
        amount: totalAmount,
        packageName: selectedPackage.title
      }));

      // Initiate Instamojo payment - this will redirect to Instamojo
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
    <div className="flex flex-col items-center justify-center py-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Pay with Instamojo</CardTitle>
          <CardDescription>Complete your payment securely using Instamojo.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <span className="font-medium">Amount:</span>
              <span>₹{totalAmount}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm text-muted-foreground">100% Secure Payment</span>
            </div>
            <Button 
              onClick={handlePayment} 
              disabled={isProcessing}
              className="w-full mt-4"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              {isProcessing ? 'Processing...' : 'Pay with Instamojo'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstamojoPayment; 