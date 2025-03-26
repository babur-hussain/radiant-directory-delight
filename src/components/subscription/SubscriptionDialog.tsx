
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, CreditCard } from 'lucide-react';
import { formatPrice } from '@/utils/format';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/utils/cn';
import RazorpayButton from './RazorpayButton';

interface SubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: ISubscriptionPackage | null;
  onSubscribeSuccess?: () => void;
}

const SubscriptionDialog: React.FC<SubscriptionDialogProps> = ({
  isOpen,
  onClose,
  selectedPackage,
  onSubscribeSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'review' | 'payment'>('review');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const { user } = useAuth();
  const { isProcessing, purchaseSubscription } = useSubscription(user?.uid);
  const { toast } = useToast();

  const handleContinueToPayment = () => {
    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to continue",
        variant: "destructive"
      });
      return;
    }
    setActiveTab('payment');
  };

  const handleSubscribe = async () => {
    if (!selectedPackage || !user) {
      toast({
        title: "Error",
        description: "Please select a package or log in to continue",
        variant: "destructive"
      });
      return;
    }

    setPaymentProcessing(true);

    try {
      await purchaseSubscription(selectedPackage);
      toast({
        title: "Subscription Successful",
        description: `You have successfully subscribed to ${selectedPackage.title}`,
      });
      
      if (onSubscribeSuccess) {
        onSubscribeSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error("Error subscribing:", error);
      toast({
        title: "Subscription Failed",
        description: error instanceof Error ? error.message : "There was an error processing your subscription",
        variant: "destructive"
      });
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast({
      title: "Payment Successful",
      description: "Your payment was processed successfully",
    });
    
    if (onSubscribeSuccess) {
      onSubscribeSuccess();
    }
    
    onClose();
  };

  const handlePaymentFailure = (error: any) => {
    console.error("Payment failed:", error);
    toast({
      title: "Payment Failed",
      description: "There was an error processing your payment. Please try again.",
      variant: "destructive"
    });
  };

  if (!selectedPackage) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Subscribe to {selectedPackage.title}</DialogTitle>
          <DialogDescription>
            Complete your subscription to access premium features
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex space-x-1 tabs mb-4">
          <Button 
            variant={activeTab === 'review' ? 'default' : 'outline'}
            className="w-1/2"
            onClick={() => setActiveTab('review')}
          >
            1. Review Package
          </Button>
          <Button 
            variant={activeTab === 'payment' ? 'default' : 'outline'}
            className="w-1/2"
            onClick={() => activeTab === 'payment' ? {} : handleContinueToPayment()}
            disabled={!agreedToTerms}
          >
            2. Payment
          </Button>
        </div>
        
        <ScrollArea className="flex-grow pr-4">
          {activeTab === 'review' ? (
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">{selectedPackage.title}</h3>
                <p className="text-2xl font-bold mt-1">
                  {formatPrice(selectedPackage.price)}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    for {selectedPackage.durationMonths || 12} months
                  </span>
                </p>
                
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground mb-2">{selectedPackage.shortDescription}</p>
                  
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">Features:</h4>
                    <ul className="space-y-2">
                      {selectedPackage.features?.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              {selectedPackage.termsAndConditions && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Terms and Conditions</h4>
                  <div className="text-sm text-muted-foreground mb-4 max-h-32 overflow-y-auto">
                    {selectedPackage.termsAndConditions}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terms" 
                      checked={agreedToTerms} 
                      onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the terms and conditions
                    </Label>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Demo Mode</AlertTitle>
                <AlertDescription>
                  This is a demo checkout page. No actual payment will be processed. 
                  Click the payment button to simulate a successful payment.
                </AlertDescription>
              </Alert>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">Order Summary</h3>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between">
                    <span>Package:</span>
                    <span>{selectedPackage.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{selectedPackage.durationMonths || 12} months</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg mt-2 pt-2 border-t">
                    <span>Total:</span>
                    <span>{formatPrice(selectedPackage.price)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
        
        <DialogFooter className="mt-4 pt-4 border-t flex sm:flex-row flex-col">
          <Button variant="outline" onClick={onClose} className="sm:mr-auto sm:mb-0 mb-3">
            Cancel
          </Button>
          
          {activeTab === 'review' ? (
            <Button 
              onClick={handleContinueToPayment} 
              disabled={!agreedToTerms}
              className={cn(!agreedToTerms ? "opacity-50 cursor-not-allowed" : "")}
            >
              Continue to Payment
            </Button>
          ) : (
            <RazorpayButton
              packageData={selectedPackage}
              onSuccess={handlePaymentSuccess}
              onFailure={handlePaymentFailure}
              buttonText="Complete Subscription"
              className="flex items-center"
              disabled={paymentProcessing || isProcessing}
            />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;
