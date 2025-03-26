
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { ISubscriptionPackage } from '@/hooks/useSubscriptionPackages';
import { useAuth } from '@/hooks/useAuth';
import RazorpayButton from './RazorpayButton';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface SubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: ISubscriptionPackage | null;
  onContinue?: () => void;
}

interface SubscriptionPackage {
  id: string;
  title: string;
  price: number;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  monthlyPrice?: number;
  setupFee?: number;
  popular?: boolean;
  type: 'Business' | 'Influencer';
  durationMonths?: number;
  advancePaymentMonths?: number;
  paymentType?: 'recurring' | 'one-time';
  billingCycle?: 'monthly' | 'yearly';
  termsAndConditions?: string;
  dashboardSections?: string[];
}

const SubscriptionDialog: React.FC<SubscriptionDialogProps> = ({
  isOpen,
  onClose,
  selectedPackage,
  onContinue,
}) => {
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { isProcessing, purchaseSubscription } = useSubscription();

  if (!selectedPackage) {
    return null;
  }

  const handleClose = () => {
    setShowPayment(false);
    setAgreeToTerms(false);
    onClose();
  };

  const handleContinue = () => {
    if (!agreeToTerms) {
      toast({
        title: 'Terms and Conditions',
        description: 'Please agree to the terms and conditions to continue.',
        variant: 'destructive',
      });
      return;
    }

    setShowPayment(true);
    if (onContinue) {
      onContinue();
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to subscribe to a package.',
        variant: 'destructive',
      });
      return;
    }

    if (!agreeToTerms) {
      toast({
        title: 'Terms and Conditions',
        description: 'Please agree to the terms and conditions to continue.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Convert to the proper ISubscriptionPackage type
      const packageData: ISubscriptionPackage = {
        id: selectedPackage.id,
        title: selectedPackage.title,
        price: selectedPackage.price,
        shortDescription: selectedPackage.shortDescription || '',
        fullDescription: selectedPackage.fullDescription || '',
        features: selectedPackage.features || [],
        monthlyPrice: selectedPackage.monthlyPrice,
        setupFee: selectedPackage.setupFee,
        popular: selectedPackage.popular,
        type: selectedPackage.type,
        durationMonths: selectedPackage.durationMonths,
        advancePaymentMonths: selectedPackage.advancePaymentMonths,
        paymentType: selectedPackage.paymentType,
        billingCycle: selectedPackage.billingCycle,
        termsAndConditions: selectedPackage.termsAndConditions,
        dashboardSections: selectedPackage.dashboardSections
      };

      const result = await purchaseSubscription(packageData);
      console.log('Subscription result:', result);

      toast({
        title: 'Subscription Success',
        description: `You have successfully subscribed to ${selectedPackage.title}!`,
      });

      handleClose();
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: 'Subscription Failed',
        description: error instanceof Error ? error.message : 'An error occurred while processing your subscription.',
        variant: 'destructive',
      });
    }
  };

  // Format price for display
  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{selectedPackage.title}</DialogTitle>
          <DialogDescription>{selectedPackage.shortDescription}</DialogDescription>
        </DialogHeader>

        {!showPayment ? (
          <>
            <div className="py-4">
              <h3 className="font-semibold text-lg">Package Details</h3>
              <p className="text-sm text-muted-foreground mt-1">{selectedPackage.fullDescription}</p>

              <div className="mt-4">
                <h4 className="font-semibold">Price</h4>
                <p className="text-2xl font-bold">{formatPrice(selectedPackage.price)}</p>
                {selectedPackage.monthlyPrice && selectedPackage.monthlyPrice > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Monthly: {formatPrice(selectedPackage.monthlyPrice)}
                  </p>
                )}
                {selectedPackage.setupFee && selectedPackage.setupFee > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Setup Fee: {formatPrice(selectedPackage.setupFee)}
                  </p>
                )}
              </div>

              <div className="mt-4">
                <h4 className="font-semibold">Features:</h4>
                <ul className="mt-2 space-y-2">
                  {selectedPackage.features && selectedPackage.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the terms and conditions
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedPackage.termsAndConditions || 'By subscribing, you agree to our standard terms of service.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleContinue} disabled={!agreeToTerms || isProcessing}>
                Continue to Payment
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="py-4">
              <h3 className="font-semibold text-lg">Payment</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Complete your subscription purchase using our secure payment gateway.
              </p>

              <Separator className="my-4" />

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Package:</span>
                  <span className="font-medium">{selectedPackage.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-medium">{formatPrice(selectedPackage.price)}</span>
                </div>
                {selectedPackage.setupFee && selectedPackage.setupFee > 0 && (
                  <div className="flex justify-between">
                    <span>Setup Fee:</span>
                    <span className="font-medium">{formatPrice(selectedPackage.setupFee)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>
                    {formatPrice(
                      selectedPackage.price + (selectedPackage.setupFee || 0)
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <RazorpayButton
                  amount={selectedPackage.price + (selectedPackage.setupFee || 0)}
                  name={selectedPackage.title}
                  description={selectedPackage.shortDescription}
                  onSuccess={handlePurchase}
                  onFailure={(error) => {
                    toast({
                      title: 'Payment Failed',
                      description: error,
                      variant: 'destructive',
                    });
                  }}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPayment(false)}>
                Back
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;
