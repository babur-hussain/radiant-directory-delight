
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import RazorpayPayment from './RazorpayPayment';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
  const { purchaseSubscription, isProcessing } = useSubscription();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setStep('details');
      setIsAgreed(false);
    }
  }, [isOpen]);
  
  // Listen for Razorpay popup events
  useEffect(() => {
    const handleRazorpayOpen = () => {
      // Auto-close the dialog when Razorpay opens
      setIsOpen(false);
    };
    
    window.addEventListener('razorpay-opened', handleRazorpayOpen);
    
    return () => {
      window.removeEventListener('razorpay-opened', handleRazorpayOpen);
    };
  }, [setIsOpen]);
  
  // Handle successful payment
  const handlePaymentSuccess = async (response: any) => {
    console.log("Payment success in dialog:", response);
    
    try {
      if (!selectedPackage) {
        throw new Error("No package selected");
      }
      
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      
      // Record the successful payment in our system
      // Since we don't have a payment_records table, we'll add the data directly to user_subscriptions
      const subscription = await purchaseSubscription(selectedPackage);
      
      if (response.razorpay_payment_id) {
        // Update the subscription with payment details including autopay information
        const updateData: any = {
          transaction_id: response.razorpay_payment_id,
          payment_method: 'razorpay',
          amount: response.amount ? response.amount / 100 : selectedPackage.price, // Convert from paise to rupees
          is_autopay_enabled: response.enableAutoPay || false
        };
        
        // Add autopay details if available
        if (response.autopayDetails && response.autopayDetails.enabled) {
          updateData.autopay_next_date = response.autopayDetails.nextBillingDate || response.nextBillingDate;
          updateData.autopay_amount = response.autopayDetails.recurringAmount || response.recurringAmount;
          updateData.autopay_remaining_count = response.autopayDetails.remainingPayments || response.recurringPaymentCount;
          updateData.autopay_total_remaining = response.autopayDetails.totalRemainingAmount || response.remainingAmount;
        }
        
        await supabase
          .from('user_subscriptions')
          .update(updateData)
          .eq('id', subscription.id);
      }
      
      // Show success toast
      toast({
        title: selectedPackage.paymentType === 'one-time' ? "Payment Successful" : "Subscription Successful",
        description: selectedPackage.paymentType === 'one-time'
          ? `You have successfully purchased ${selectedPackage.title}`
          : `You have successfully subscribed to ${selectedPackage.title}`,
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
  
  // Check if this is a one-time package or recurring
  const isOneTimePackage = selectedPackage.paymentType === 'one-time';
  
  // Calculate pricing details for display
  const setupFee = selectedPackage.setupFee || 0;
  const recurringAmount = isOneTimePackage ? 0 : selectedPackage.price || 0;
  const advanceMonths = selectedPackage.advancePaymentMonths || 0;
  
  // Calculate initial payment (setup fee + advance payment for recurring)
  const initialPayment = isOneTimePackage 
    ? selectedPackage.price || 0 
    : setupFee + (selectedPackage.billingCycle === 'monthly' 
        ? (selectedPackage.monthlyPrice || 0) * advanceMonths 
        : recurringAmount);
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-xl">
        {step === 'details' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {selectedPackage.title}
              </DialogTitle>
              <DialogDescription className="text-base pt-2">
                {selectedPackage.shortDescription || `${selectedPackage.type} package for your needs`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Package details */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Package Details</h3>
                <p className="text-sm text-gray-600 mb-4">{selectedPackage.fullDescription || selectedPackage.shortDescription}</p>
                
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Billing</span>
                    <span>
                      {isOneTimePackage 
                        ? 'One-time payment' 
                        : `${selectedPackage.billingCycle === 'monthly' ? 'Monthly' : 'Annual'} subscription`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Duration</span>
                    <span>
                      {isOneTimePackage 
                        ? `${selectedPackage.durationMonths || 12} months` 
                        : 'Ongoing until cancelled'}
                    </span>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex justify-between mb-2 font-medium">
                    <span>Price</span>
                    <span>
                      {formatPrice(selectedPackage.billingCycle === 'monthly' && selectedPackage.monthlyPrice
                        ? selectedPackage.monthlyPrice
                        : selectedPackage.price)} 
                      {isOneTimePackage ? '' : `/${selectedPackage.billingCycle || 'year'}`}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Features section */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Features</h3>
                <ul className="space-y-2">
                  {selectedPackage.features && selectedPackage.features.length > 0 ? (
                    selectedPackage.features.map((feature, index) => (
                      <li key={index} className="flex">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))
                  ) : (
                    // Default features if none specified
                    <>
                      <li className="flex">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>{selectedPackage.title.includes('Premium') ? 'Premium' : 'Basic'} {selectedPackage.type.toLowerCase()} listing</span>
                      </li>
                      <li className="flex">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>{selectedPackage.title.includes('Premium') ? 'Priority' : 'Email'} support</span>
                      </li>
                      <li className="flex">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>{selectedPackage.title.includes('Premium') ? '5' : '1'} location{selectedPackage.title.includes('Premium') ? 's' : ''}</span>
                      </li>
                      {selectedPackage.title.includes('Premium') && (
                        <li className="flex">
                          <Check className="h-5 w-5 text-green-500 mr-2" />
                          <span>Featured in search</span>
                        </li>
                      )}
                    </>
                  )}
                </ul>
              </div>
              
              {/* Terms and conditions */}
              <div>
                <div className="flex items-start space-x-2">
                  <div 
                    className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center cursor-pointer mt-0.5" 
                    onClick={() => setIsAgreed(!isAgreed)}
                  >
                    {isAgreed && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="text-sm text-gray-600">
                    I agree to the <span className="text-primary cursor-pointer">Terms & Conditions</span> and 
                    <span className="text-primary cursor-pointer"> Privacy Policy</span>. {!isOneTimePackage && 
                    "I understand that this is a recurring subscription that will be billed according to the package cycle."}
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="w-full sm:w-auto" 
                onClick={handleProceedToPayment} 
                disabled={!isAgreed || isProcessing}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {isProcessing ? 'Processing...' : 'Proceed to Payment'}
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
