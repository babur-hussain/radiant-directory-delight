
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, X, CreditCard, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import RazorpayPayment from './RazorpayPayment';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks';
import { useNavigate } from 'react-router-dom';

interface SubscriptionDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedPackage: ISubscriptionPackage | null;
}

const SubscriptionDialog: React.FC<SubscriptionDialogProps> = ({ 
  isOpen, 
  setIsOpen, 
  selectedPackage 
}) => {
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [isAgreed, setIsAgreed] = useState(false);
  const { toast } = useToast();
  const { initiateSubscription, isProcessing } = useSubscription();
  const navigate = useNavigate();
  
  // Handle successful payment
  const handlePaymentSuccess = async (response: any) => {
    console.log("Payment success in dialog:", response);
    
    try {
      if (!selectedPackage) {
        throw new Error("No package selected");
      }
      
      // Calculate advance payment months
      const advanceMonths = response.advanceMonths || selectedPackage.advancePaymentMonths || 0;
      
      // Prepare payment details from Razorpay response
      const paymentDetails = {
        packageName: selectedPackage.title,
        amount: response.amount || 0,
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id,
        paymentType: selectedPackage.paymentType || 'recurring',
        subscriptionId: response.razorpay_subscription_id || response.subscriptionId, 
        recurringAmount: selectedPackage.price,
        billingCycle: selectedPackage.billingCycle,
        advanceMonths: advanceMonths,
        // Pass the next billing date if available
        nextBillingDate: response.nextBillingDate,
        // Ensure all necessary fields are passed
        packageId: selectedPackage.id
      };
      
      // Record the subscription in the database
      await initiateSubscription(selectedPackage.id, paymentDetails);
      
      // Show success toast
      toast({
        title: selectedPackage.paymentType === 'one-time' ? "Payment Successful" : "Subscription Successful",
        description: selectedPackage.paymentType === 'one-time'
          ? `You have successfully purchased ${selectedPackage.title}`
          : `You have successfully subscribed to ${selectedPackage.title}`,
        variant: "success"
      });
      
      // Close dialog
      setIsOpen(false);
      
      // Reset step for next time
      setStep('details');
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error("Error processing subscription after payment:", error);
      
      toast({
        title: "Subscription Error",
        description: error instanceof Error ? error.message : "Failed to complete subscription",
        variant: "destructive"
      });
    }
  };
  
  // Handle payment failure
  const handlePaymentFailure = (error: any) => {
    console.error("Payment failure in dialog:", error);
    
    toast({
      title: "Payment Failed",
      description: error.message || "Your payment attempt was unsuccessful. Please try again.",
      variant: "destructive"
    });
    
    // Return to details step
    setStep('details');
  };
  
  // Move to payment step
  const handleProceedToPayment = () => {
    if (!isAgreed) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the terms and conditions to continue.",
        variant: "info"
      });
      return;
    }
    
    setStep('payment');
  };
  
  // Format price for display
  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };
  
  if (!selectedPackage) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-xl">
        {step === 'details' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center justify-between">
                <span>{selectedPackage.title}</span>
                {selectedPackage.paymentType === 'one-time' ? (
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                    One-time payment
                  </span>
                ) : (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Recurring subscription
                  </span>
                )}
              </DialogTitle>
              <DialogDescription className="text-base pt-2">
                {selectedPackage.shortDescription}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Subscription Details</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Package:</span>
                    <span className="font-medium">{selectedPackage.title}</span>
                  </li>
                  {selectedPackage.paymentType === 'one-time' ? (
                    <>
                      <li className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-medium">{selectedPackage.durationMonths || 12} months</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Payment:</span>
                        <span className="font-medium">{formatPrice(selectedPackage.price || 0)} one-time</span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex justify-between">
                        <span>Billing Cycle:</span>
                        <span className="font-medium">{selectedPackage.billingCycle || 'yearly'}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Setup Fee:</span>
                        <span className="font-medium">{formatPrice(selectedPackage.setupFee || 0)}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Recurring Payment:</span>
                        <span className="font-medium">{formatPrice(selectedPackage.price || 0)}/{selectedPackage.billingCycle || 'year'}</span>
                      </li>
                      {selectedPackage.advancePaymentMonths > 0 && (
                        <li className="flex justify-between">
                          <span>Advance Payment:</span>
                          <span className="font-medium">{selectedPackage.advancePaymentMonths} months</span>
                        </li>
                      )}
                    </>
                  )}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Features</h3>
                <ul className="space-y-1">
                  {selectedPackage.features?.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Separator />
              
              <div className="flex items-start space-x-2">
                <div 
                  className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center cursor-pointer mt-0.5" 
                  onClick={() => setIsAgreed(!isAgreed)}
                >
                  {isAgreed && <CheckCircle className="h-4 w-4 text-primary" />}
                </div>
                <div className="text-sm text-muted-foreground">
                  I agree to the <span className="text-primary cursor-pointer">Terms & Conditions</span> and 
                  <span className="text-primary cursor-pointer"> Privacy Policy</span>. {selectedPackage.paymentType === 'recurring' && 
                  "I understand that this is a recurring subscription that will be billed according to the package cycle."}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleProceedToPayment} disabled={!isAgreed || isProcessing}>
                {isProcessing ? 'Processing...' : 'Continue to Payment'}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        ) : (
          <RazorpayPayment 
            selectedPackage={selectedPackage}
            onSuccess={handlePaymentSuccess}
            onFailure={handlePaymentFailure}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;
